import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { Download, FileText, PlusCircle } from 'react-bootstrap-icons';
import CarsTable from '../CarsTable/CarsTable';
import {
  fetchActPdf,
  fetchVehicleWorkSummary,
  fetchWorksCatalog,
  saveAct,
  saveVehicleWork,
  fetchCustomers,
  fetchDefects
} from '../../utils/constantsApi';

const getVehicleId = (car) => car?.id || car?.vehicle_id || car?.vehicleId || car?.garage_number;

const getValueText = (value) => {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(getValueText).filter(Boolean).join(', ');
  if (typeof value === 'object') return value.value || value.name || value.code || JSON.stringify(value);
  return String(value);
};

const getVehicleName = (vehicle) => {
  if (!vehicle) return '';
  const model = getValueText(vehicle.ts_model);
  const garage = vehicle.garage_number ? `Гаражный № ${vehicle.garage_number}` : '';
  return [garage, model].filter(Boolean).join(', ');
};

const getSelectedOptions = (event) => {
  return Array.from(event.target.selectedOptions).map((option) => Number(option.value));
};

const parseIdList = (value) => {
  return String(value || '')
    .split(',')
    .map((item) => Number(item.trim()))
    // allow zero as valid id if provided by UI; filter out non-numeric
    .filter((item) => Number.isFinite(item));
};

const toApiDateTime = (date, time) => {
  if (!time) return '';
  if (time.includes('T') || time.endsWith('Z')) return time;
  if (!date) return time;
  return new Date(`${date}T${time}`).toISOString();
};

// Format time for API: expect hh:mm[:ss[.uuuuuu]] (no timezone)
const formatApiTime = (date, time) => {
  if (!time) return '';
  let t = String(time);
  // if full ISO datetime provided, extract time portion after 'T'
  if (t.includes('T')) {
    t = t.split('T')[1] || t;
  }
  // remove timezone designators (Z or +hh:mm or -hh:mm)
  const tzPos = Math.max(t.indexOf('Z'), t.indexOf('+'), t.indexOf('-'));
  if (tzPos > 0) {
    t = t.slice(0, tzPos);
  }
  t = t.trim();
  // ensure we return at least HH:MM (if seconds present, keep them)
  const match = t.match(/^(\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)/);
  return match ? match[1] : t.slice(0,5);
};

const downloadBlob = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const openDownloadedFile = (download) => {
  if (download.type === 'blob') {
    downloadBlob(download.blob, download.fileName);
    return true;
  }

  if (download.url) {
    window.open(download.url, '_blank', 'noopener,noreferrer');
    return true;
  }

  return false;
};

const toWorkRows = (works) => {
  return works.map((work) => ({
    id: work.id,
    event_type_text: work.event_type_text || work.event_type,
    event_date: work.event_date,
    work_start_time: work.work_start_time,
    work_end_time: work.work_end_time,
    work_duration_hours: work.work_duration_hours,
    works: getValueText(work.works),
    works_done: work.works_done,
    defects: getValueText(work.defects),
    defect_comment: work.defect_comment,
    has_issue: work.has_issue ? 'Да' : 'Нет',
    todo_comment: work.todo_comment,
    executors: getValueText(work.executors)
  }));
};

const workColumns = [
  'event_type_text',
  'event_date',
  'work_start_time',
  'work_end_time',
  'work_duration_hours',
  'works',
  'works_done',
  'defects',
  'defect_comment',
  'has_issue',
  'todo_comment',
  'executors'
];

const workLabels = {
  event_type_text: 'Тип события',
  event_date: 'Дата',
  work_start_time: 'Начало',
  work_end_time: 'Окончание',
  work_duration_hours: 'Часы',
  works: 'Работы',
  works_done: 'Выполнено',
  defects: 'Дефекты',
  defect_comment: 'Комментарий к дефектам',
  has_issue: 'Есть проблема',
  todo_comment: 'Что сделать',
  executors: 'Исполнители',
  
};

const createInitialWorkForm = () => ({
  event_type: 'TO',
  event_date: new Date().toISOString().slice(0, 10),
  work_start_time: '',
  work_end_time: '',
  works_done: '',
  defect_comment: '',
  todo_comment: '',
  work_ids: [],
  defect_ids: [],
  executor_ids: ''
});

const ActModal = ({ show, user, vehicle, workEvents, onClose, onDataChanged }) => {
  const [form, setForm] = useState({
    customer: '',
    act_no: '',
    act_date: new Date().toISOString().slice(0, 10),
    event_ids: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setForm({
        customer: '',
        act_no: '',
        act_date: new Date().toISOString().slice(0, 10),
        event_ids: []
      });
      setError('');
    }
  }, [show]);

  useEffect(() => {
    if (!show) return;
    const loadCustomers = async () => {
      setCustomersLoading(true);
      try {
        const data = await fetchCustomers(user);
        setCustomers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Customers loading error:', err);
        setCustomers([]);
      } finally {
        setCustomersLoading(false);
      }
    };

    loadCustomers();
  }, [show, user]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGeneratePdf = async () => {
    // require act number
    if (!form.act_no || String(form.act_no).trim() === '') {
      setError('Поле "Номер акта" не может быть пустым.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const payload = {
        customer: Number(form.customer || 0),
        act_no: form.act_no || '',
        act_date: form.act_date,
        items: form.event_ids.map((eventId, index) => ({
          event: eventId,
          position: index + 1
        }))
      };

      const savedAct = await saveAct(user, payload);
      const actId = savedAct && (savedAct.id || savedAct.act_id || savedAct.actId);

      if (!actId) {
        setError('Сервер не вернул id акта. Невозможно скачать PDF.');
        return;
      }

      const pdf = await fetchActPdf(user, actId);
      if (!openDownloadedFile(pdf)) {
        setError('Сервер вернул PDF без файла или ссылки на скачивание.');
        return;
      }

      if (onDataChanged) {
        await onDataChanged();
      }

      onClose();
    } catch (saveError) {
      console.error('Act PDF generation error:', saveError);
      const data = saveError && saveError.responseData ? saveError.responseData : null;
      if (data && typeof data === 'object') {
        const parts = Object.keys(data).map((key) => {
          const val = data[key];
          if (Array.isArray(val)) return `${key}: ${val.join(', ')}`;
          if (typeof val === 'string') return `${key}: ${val}`;
          return `${key}: ${JSON.stringify(val)}`;
        });
        setError(parts.join('; '));
      } else {
        setError('Не удалось сохранить акт или скачать PDF. ' + (saveError?.message || ''));
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Сформировать акт</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>ТС</Form.Label>
            <Form.Control value={getVehicleName(vehicle)} readOnly />
          </Form.Group>

          <div className="row">
            <Form.Group className="mb-3 col-md-4">
              <Form.Label>Заказчик</Form.Label>
              {customersLoading ? (
                <div className="d-flex align-items-center"><Spinner animation="border" size="sm" /></div>
              ) : (
                <Form.Select value={form.customer} onChange={(event) => updateField('customer', event.target.value)}>
                  <option value="">-- Выберите заказчика --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || c.value || c.id}</option>
                  ))}
                </Form.Select>
              )}
            </Form.Group>
            <Form.Group className="mb-3 col-md-4">
              <Form.Label>Номер акта</Form.Label>
              <Form.Control value={form.act_no} onChange={(event) => updateField('act_no', event.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3 col-md-4">
              <Form.Label>Дата акта</Form.Label>
              <Form.Control
                type="date"
                value={form.act_date}
                onChange={(event) => updateField('act_date', event.target.value)}
              />
            </Form.Group>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Перечень выполненных работ</Form.Label>
            <Form.Select
              multiple
              value={form.event_ids.map(String)}
              onChange={(event) => updateField('event_ids', getSelectedOptions(event))}
              style={{ minHeight: 160 }}
            >
              {workEvents.map((work, index) => (
                <option key={work.id} value={work.id}>
                  {[
                    `#${index + 1}`,
                    work.event_date,
                    work.event_type_text || work.event_type,
                    work.works_done || getValueText(work.works)
                  ].filter(Boolean).join(' - ')}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={isSaving}>
          Отмена
        </Button>
        <Button variant="primary" onClick={handleGeneratePdf} disabled={isSaving}>
          {isSaving ? <Spinner animation="border" size="sm" className="me-2" /> : <Download size={16} className="me-2" />}
          Сгенерировать PDF
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const AddWorkModal = ({ show, user, vehicle, worksCatalog, onClose, onSaved, onDataChanged }) => {
  const [form, setForm] = useState(createInitialWorkForm);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [defectsCatalog, setDefectsCatalog] = useState([]);
  const [isDefectsLoading, setIsDefectsLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setForm(createInitialWorkForm());
      setError('');
    }
  }, [show]);

  useEffect(() => {
    if (!show) return;
    const loadDefects = async () => {
      setIsDefectsLoading(true);
      try {
        const data = await fetchDefects(user);
        setDefectsCatalog(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Defects loading error:', err);
        setDefectsCatalog([]);
      } finally {
        setIsDefectsLoading(false);
      }
    };

    loadDefects();
  }, [show, user]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');

    try {
      await saveVehicleWork(user, {
        vehicle: Number(getVehicleId(vehicle) || 0),
        event_type: form.event_type || 'TO',
        event_date: form.event_date,
        // API expects time in format hh:mm[:ss[.uuuuuu]] (no timezone). Send time-only strings.
        work_start_time: formatApiTime(form.event_date, form.work_start_time),
        work_end_time: formatApiTime(form.event_date, form.work_end_time),
        works: form.work_ids,
        works_done: form.works_done,
            defects: Array.isArray(form.defect_ids) ? form.defect_ids : parseIdList(form.defect_ids),
        executors: parseIdList(form.executor_ids),
        defect_comment: form.defect_comment,
        todo_comment: form.todo_comment
      });
      onSaved();
      if (onDataChanged) {
        await onDataChanged();
      }
      onClose();
    } catch (saveError) {
      console.error('Vehicle work saving error:', saveError);
      // try to extract validation errors returned by the API
      const data = saveError && saveError.responseData ? saveError.responseData : null;
      if (data && typeof data === 'object') {
        // build readable message
        const parts = Object.keys(data).map((key) => {
          const val = data[key];
          if (Array.isArray(val)) return `${key}: ${val.join(', ')}`;
          if (typeof val === 'string') return `${key}: ${val}`;
          return `${key}: ${JSON.stringify(val)}`;
        });
        setError(parts.join('; '));
      } else {
        setError(`Не удалось сохранить проделанную работу. ${saveError?.message || ''}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Добавить проделанную работу</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>ТС</Form.Label>
            <Form.Control value={getVehicleName(vehicle)} readOnly />
          </Form.Group>

          <div className="row">
            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Тип события</Form.Label>
              <Form.Control value={form.event_type} onChange={(event) => updateField('event_type', event.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Дата</Form.Label>
              <Form.Control type="date" value={form.event_date} onChange={(event) => updateField('event_date', event.target.value)} />
            </Form.Group>
          </div>

          <div className="row">
            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Начало</Form.Label>
              <Form.Control type="time" value={form.work_start_time} onChange={(event) => updateField('work_start_time', event.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Окончание</Form.Label>
              <Form.Control type="time" value={form.work_end_time} onChange={(event) => updateField('work_end_time', event.target.value)} />
            </Form.Group>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Перечень работ</Form.Label>
            <Form.Select
              multiple
              value={form.work_ids.map(String)}
              onChange={(event) => updateField('work_ids', getSelectedOptions(event))}
              style={{ minHeight: 130 }}
            >
              {worksCatalog.map((work) => (
                <option key={work.id} value={work.id}>
                  {[work.code, work.value || work.name, work.description].filter(Boolean).join(' - ')}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Выполнено</Form.Label>
            <Form.Control as="textarea" rows={2} value={form.works_done} onChange={(event) => updateField('works_done', event.target.value)} />
          </Form.Group>

          <div className="row">
            <Form.Group className="mb-3 col-md-6">
              <Form.Label>Дефекты</Form.Label>
              {isDefectsLoading ? (
                <div className="d-flex align-items-center"><Spinner animation="border" size="sm" /></div>
              ) : (
                <Form.Select
                  multiple
                  value={form.defect_ids.map(String)}
                  onChange={(event) => updateField('defect_ids', getSelectedOptions(event))}
                >
                  {defectsCatalog.map((d) => (
                    <option key={d.id} value={d.id}>{d.name || d.value || d.id}</option>
                  ))}
                </Form.Select>
              )}
            </Form.Group>
            <Form.Group className="mb-3 col-md-6">
              <Form.Label>ID исполнителей через запятую</Form.Label>
              <Form.Control value={form.executor_ids} onChange={(event) => updateField('executor_ids', event.target.value)} />
            </Form.Group>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Комментарий к дефектам</Form.Label>
            <Form.Control value={form.defect_comment} onChange={(event) => updateField('defect_comment', event.target.value)} />
          </Form.Group>

          <Form.Group>
            <Form.Label>Что сделать</Form.Label>
            <Form.Control as="textarea" rows={2} value={form.todo_comment} onChange={(event) => updateField('todo_comment', event.target.value)} />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose} disabled={isSaving}>
          Отмена
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving && <Spinner animation="border" size="sm" className="me-2" />}
          Сохранить
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const VehicleHistoryModal = ({ show, car, user, onClose, onDataChanged }) => {
  const [summary, setSummary] = useState({ vehicle: null, works: [] });
  const [worksCatalog, setWorksCatalog] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [showActModal, setShowActModal] = useState(false);
  const [showAddWorkModal, setShowAddWorkModal] = useState(false);
  const [error, setError] = useState('');
  const [catalogError, setCatalogError] = useState('');

  const vehicleId = getVehicleId(car);
  const vehicle = summary.vehicle || car || {};

  const loadSummary = useCallback(async () => {
    if (!vehicleId) return;

    setIsLoading(true);
    setError('');

    try {
      const data = await fetchVehicleWorkSummary(user, vehicleId);
      setSummary({
        vehicle: data.vehicle || car,
        works: Array.isArray(data.works) ? data.works : []
      });
    } catch (loadError) {
      console.error('Vehicle work summary loading error:', loadError);
      setSummary({ vehicle: car, works: [] });
      setError('Не удалось загрузить данные о проделанных работах.');
    } finally {
      setIsLoading(false);
    }
  }, [car, user, vehicleId]);

  useEffect(() => {
    if (!show || !vehicleId) return;
    loadSummary();
  }, [loadSummary, show, vehicleId]);

  useEffect(() => {
    if (!show) return;

    const loadWorksCatalog = async () => {
      setIsCatalogLoading(true);
      setCatalogError('');

      try {
        const data = await fetchWorksCatalog(user);
        setWorksCatalog(data);
      } catch (loadError) {
        console.error('Works catalog loading error:', loadError);
        setWorksCatalog([]);
        setCatalogError('Не удалось загрузить список работ с сервера.');
      } finally {
        setIsCatalogLoading(false);
      }
    };

    loadWorksCatalog();
  }, [show, user]);

  const workRows = useMemo(() => toWorkRows(summary.works), [summary.works]);

  return (
    <>
      <Modal show={show} onHide={onClose} size="xl" centered fullscreen="lg-down">
        <Modal.Header closeButton>
          <Modal.Title>
            Проделанные работы ТС {vehicle?.garage_number ? `№ ${vehicle.garage_number}` : ''}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="d-flex flex-wrap justify-content-end gap-2 mb-3">
            <Button
              variant="outline-primary"
              onClick={() => setShowAddWorkModal(true)}
              disabled={!vehicleId}
              className="d-flex align-items-center gap-2"
            >
              <PlusCircle size={16} />
              Добавить проделанную работу
            </Button>
            <Button
              variant="primary"
              onClick={() => setShowActModal(true)}
              disabled={!vehicleId || isCatalogLoading}
              className="d-flex align-items-center gap-2"
            >
              {isCatalogLoading ? <Spinner animation="border" size="sm" /> : <FileText size={16} />}
              Сформировать акт
            </Button>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}
          {catalogError && <Alert variant="warning">{catalogError}</Alert>}

          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <Spinner animation="border" role="status" />
            </div>
          ) : (
            <CarsTable
              cars={workRows}
              columns={workColumns}
              columnLabels={workLabels}
              title="Проделанные работы"
            />
          )}
        </Modal.Body>
      </Modal>

      <ActModal
        show={showActModal}
        user={user}
        vehicle={vehicle}
        workEvents={summary.works}
        onClose={() => setShowActModal(false)}
        onDataChanged={onDataChanged}
      />

      <AddWorkModal
        show={showAddWorkModal}
        user={user}
        vehicle={vehicle}
        worksCatalog={worksCatalog}
        onClose={() => setShowAddWorkModal(false)}
        onSaved={loadSummary}
        onDataChanged={onDataChanged}
      />
    </>
  );
};

export default VehicleHistoryModal;
