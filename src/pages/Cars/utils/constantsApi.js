
import { getBasicAuthHeader } from '../../../auth/AuthContext';

// базовый URL для запросов (если не задан в .env будет реальный сервер)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.diplom.miray-tech.ru/api';

export const CAR_API_ENDPOINTS = {
  vehicles: `${API_BASE_URL}/assets/vehicles/view/`,
  vehicleWorkSummary: (vehicleId) => `${API_BASE_URL}/assets/vehicles/${vehicleId}/work-summary/`,
  worksCatalog: `${API_BASE_URL}/directories/works/`,
  defectsCatalog: `${API_BASE_URL}/directories/defects/`,
  saveAct: `${API_BASE_URL}/maintenance/acts/`,
  actPdf: (actId) => `${API_BASE_URL}/reports/service-acts/${actId}/pdf/`,
  saveVehicleWork: `${API_BASE_URL}/maintenance/events/`,
  customers: `${API_BASE_URL}/customers/`,
  installations: `${API_BASE_URL}/assets/installations/`,
  asptUnits: `${API_BASE_URL}/assets/aspt-units/`,
  vehiclesCreate: `${API_BASE_URL}/assets/vehicles/`
};

// утилита формирования заголовков с Basic Auth
const makeHeaders = (user) => {
  const headers = { 'Content-Type': 'application/json', ...getBasicAuthHeader(user) };
  return headers;
};

const makeDownloadHeaders = (user) => ({ ...getBasicAuthHeader(user) });

const downloadResponse = async (response, fallbackName) => {
  const contentType = response.headers.get('content-type') || '';
  const disposition = response.headers.get('content-disposition') || '';
  const fileNameMatch = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
  const fileName = fileNameMatch ? decodeURIComponent(fileNameMatch[1]) : fallbackName;

  if (contentType.includes('application/json')) {
    const data = await response.json();
    return {
      type: 'json',
      fileName: data.fileName || data.filename || fileName,
      url: data.url || data.download_url || data.downloadUrl,
      data
    };
  }

  const blob = await response.blob();
  return { type: 'blob', fileName, blob };
};

export const fetchVehicleWorkSummary = async (user, vehicleId) => {
  const headers = makeHeaders(user);
  const response = await fetch(CAR_API_ENDPOINTS.vehicleWorkSummary(vehicleId), {
    method: 'GET',
    headers
  });

  if (!response.ok) {
    throw new Error(`Work summary API error: ${response.status}`);
  }

  return response.json();
};

export const fetchWorksCatalog = async (user) => {
  const response = await fetch(CAR_API_ENDPOINTS.worksCatalog, {
    method: 'GET',
    headers: makeHeaders(user)
  });

  if (!response.ok) {
    throw new Error(`Works catalog API error: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.results || data.works || [];
};

export const fetchDefects = async (user) => {
  const response = await fetch(CAR_API_ENDPOINTS.defectsCatalog, {
    method: 'GET',
    headers: makeHeaders(user)
  });

  if (!response.ok) {
    throw new Error(`Defects catalog API error: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.results || data.defects || [];
};

export const fetchCustomers = async (user) => {
  const response = await fetch(CAR_API_ENDPOINTS.customers, {
    method: 'GET',
    headers: makeHeaders(user)
  });

  if (!response.ok) {
    throw new Error(`Customers API error: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.results || [];
};

export const saveAct = async (user, payload) => {
  const response = await fetch(CAR_API_ENDPOINTS.saveAct, {
    method: 'POST',
    headers: makeHeaders(user),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let data = null;
    try {
      data = await response.json();
    } catch (e) {
      // ignore
    }
    const err = new Error(`Save act API error: ${response.status}`);
    err.status = response.status;
    err.responseData = data;
    throw err;
  }

  return response.json();
};

export const fetchActPdf = async (user, actId) => {
  const response = await fetch(CAR_API_ENDPOINTS.actPdf(actId), {
    method: 'GET',
    headers: makeDownloadHeaders(user)
  });

  if (!response.ok) {
    throw new Error(`Act PDF API error: ${response.status}`);
  }

  return downloadResponse(response, `act-${actId}.pdf`);
};

export const saveVehicleWork = async (user, payload) => {
  const response = await fetch(CAR_API_ENDPOINTS.saveVehicleWork, {
    method: 'POST',
    headers: makeHeaders(user),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    // try to parse JSON body with validation errors
    let data = null;
    try {
      data = await response.json();
    } catch (e) {
      // ignore parse errors
    }
    const err = new Error(`Save vehicle work API error: ${response.status}`);
    err.status = response.status;
    err.responseData = data;
    throw err;
  }

  return response.json();
};

export const fetchAsptUnits = async (user) => {
  const response = await fetch(CAR_API_ENDPOINTS.asptUnits, {
    method: 'GET',
    headers: makeHeaders(user)
  });

  if (!response.ok) {
    throw new Error(`Aspt units API error: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.results || [];
};

export const fetchAsptModels = async (user) => {
  const response = await fetch(`${API_BASE_URL}/directories/aspt-models/`, {
    method: 'GET',
    headers: makeHeaders(user)
  });

  if (!response.ok) {
    throw new Error(`Aspt models API error: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.results || [];
};

export const findAsptModelIdByName = (asptModels, asptType) => {
  if (!asptType || !Array.isArray(asptModels) || asptModels.length === 0) {
    return null;
  }

  let searchName = '';
  if (typeof asptType === 'object') {
    searchName = (asptType.name || asptType.value || '').trim();
  } else if (typeof asptType === 'string') {
    searchName = asptType.trim();
  }

  if (!searchName) {
    return null;
  }

  const exactMatch = asptModels.find((model) => model.name === searchName);
  if (exactMatch) {
    return exactMatch.id;
  }

  const partialMatch = asptModels.find(
    (model) =>
      model.name &&
      (searchName.endsWith(model.name) || searchName.includes(model.name))
  );

  return partialMatch ? partialMatch.id : null;
};

export const createAsptUnit = async (user, payload) => {
  const response = await fetch(CAR_API_ENDPOINTS.asptUnits, {
    method: 'POST',
    headers: makeHeaders(user),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let data = null;
    try {
      data = await response.json();
    } catch (e) {}
    const err = new Error(`Create aspt unit API error: ${response.status}`);
    err.status = response.status;
    err.responseData = data;
    throw err;
  }

  return response.json();
};

export const ensureAsptUnit = async (user, { asptModelId, note = '' }) => {
  const serialNo = String(asptModelId);

  try {
    const created = await createAsptUnit(user, {
      aspt_model: asptModelId,
      serial_no: serialNo,
      note
    });
    const unitId = Number(created.id || created.pk);
    if (!unitId) {
      throw new Error('Create aspt unit response has no id');
    }
    return unitId;
  } catch (e) {
    const isDuplicate = e.status === 400 && e.responseData?.serial_no;
    if (!isDuplicate) {
      throw e;
    }

    const units = await fetchAsptUnits(user);
    const existing = units.find(
      (unit) => unit.serial_no === serialNo || Number(unit.aspt_model) === Number(asptModelId)
    );
    if (existing) {
      return Number(existing.id);
    }

    throw e;
  }
};

export const fetchInstallations = async (user) => {
  const response = await fetch(CAR_API_ENDPOINTS.installations, {
    method: 'GET',
    headers: makeHeaders(user)
  });

  if (!response.ok) {
    throw new Error(`Installations API error: ${response.status}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : data.results || [];
};

export const findInstallationIdForVehicle = (installations, vehicleId) => {
  const active = installations.find(
    (item) => Number(item.vehicle) === Number(vehicleId) && !item.removed_at
  );
  if (active) {
    return active.id;
  }

  const existing = installations.find((item) => Number(item.vehicle) === Number(vehicleId));
  return existing ? existing.id : null;
};

export const saveOrUpdateInstallation = async (user, vehicleId, payload, installationId = null) => {
  let resolvedId = installationId;

  if (!resolvedId) {
    const installations = await fetchInstallations(user);
    resolvedId = findInstallationIdForVehicle(installations, vehicleId);
  }

  if (resolvedId) {
    return updateInstallation(user, resolvedId, payload);
  }

  return saveInstallation(user, payload);
};

export const saveInstallation = async (user, payload) => {
  const response = await fetch(CAR_API_ENDPOINTS.installations, {
    method: 'POST',
    headers: makeHeaders(user),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let data = null;
    try {
      data = await response.json();
    } catch (e) {}
    const err = new Error(`Save installation API error: ${response.status}`);
    err.status = response.status;
    err.responseData = data;
    throw err;
  }

  return response.json();
};

export const updateInstallation = async (user, installationId, payload) => {
  const url = `${CAR_API_ENDPOINTS.installations}${installationId}/`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: makeHeaders(user),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let data = null;
    try {
      data = await response.json();
    } catch (e) {}
    const err = new Error(`Update installation API error: ${response.status}`);
    err.status = response.status;
    err.responseData = data;
    throw err;
  }

  return response.json();
};

export const saveVehicle = async (user, payload) => {
  const response = await fetch(CAR_API_ENDPOINTS.vehiclesCreate, {
    method: 'POST',
    headers: makeHeaders(user),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let data = null;
    try {
      data = await response.json();
    } catch (e) {}
    const err = new Error(`Save vehicle API error: ${response.status}`);
    err.status = response.status;
    err.responseData = data;
    throw err;
  }

  return response.json();
};

export const updateVehicle = async (user, vehicleId, payload) => {
  const url = `${CAR_API_ENDPOINTS.vehiclesCreate}${vehicleId}/`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: makeHeaders(user),
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    let data = null;
    try {
      data = await response.json();
    } catch (e) {}
    const err = new Error(`Update vehicle API error: ${response.status}`);
    err.status = response.status;
    err.responseData = data;
    throw err;
  }

  return response.json();
};

/**
 * Загрузить типы ТС с бекэнда
 * @param {Object} user - объект пользователя с username и password
 * @returns {Promise<Array>} Массив типов ТС
 */
export const fetchVehicleTypes = async (user) => {
  try {
    const headers = makeHeaders(user);
    const response = await fetch(`${API_BASE_URL}/vehicle-types`, { headers });
    if (!response.ok) throw new Error('Ошибка загрузки типов ТС');
    const data = await response.json();
    console.log('Ответ сервера для vehicle-types:', data);
    const transformed = Array.isArray(data) 
      ? data.map(item => ({
          id: item.id,
          value: item.name || item.value || ''
        }))
      : [];
    
    return transformed;
  } catch (error) {
    console.error('Ошибка загрузки типов ТС:', error);
    const { VEHICLE_TYPES } = await import('./constants');
    return VEHICLE_TYPES; 
  }
};

/**
 * Загрузить модели ТС с бекэнда
 * @param {Object} user - объект пользователя с username и password
 * @returns {Promise<Array>} Массив моделей ТС
 */
export const fetchVehicleModels = async (user) => {
  try {
    const headers = makeHeaders(user);
    const response = await fetch(`${API_BASE_URL}/directories/vehicle-models/`, { headers });
    if (!response.ok) throw new Error('Ошибка загрузки моделей ТС');
    const data = await response.json();
    console.log('Ответ сервера для vehicle-models:', data);
    const items = Array.isArray(data) ? data : [];
    // load full vehicle manufacturers list once
    let manufacturers = [];
    try {
      const mr = await fetch(`${API_BASE_URL}/directories/vehicle-manufacturers/`, { headers });
      if (mr.ok) {
        const md = await mr.json();
        manufacturers = Array.isArray(md) ? md : md.results || [];
      }
    } catch (e) {
      // ignore errors
    }

    const manufacturersMap = manufacturers.reduce((acc, m) => {
      acc[m.id] = m && (m.name || m.value) ? (m.name || m.value) : String(m.id);
      return acc;
    }, {});

    const transformed = items.map(item => {
      const brandName = manufacturersMap[item.manufacturer || item.brand] || item.brand_name || item.brand || '';
      return {
        id: item.id,
        value: item.name || item.value || '',
        brand: brandName
      };
    });

    return transformed;
  } catch (error) {
    console.error('Ошибка загрузки моделей ТС:', error);
    const { VEHICLE_MODELS } = await import('./constants');
    return VEHICLE_MODELS; // fallback
  }
};

/**
 * Загрузить локации с бекэнда
 * @param {Object} user - объект пользователя с username и password
 * @returns {Promise<Array>} Массив локаций
 */
export const fetchLocations = async (user) => {
  try {
    // реальный endpoint указан в задании
    const headers = makeHeaders(user);
    const response = await fetch(`${API_BASE_URL}/directories/locations/`, { headers });
    if (!response.ok) throw new Error('Ошибка загрузки локаций');
    const data = await response.json();
    console.log('Ответ сервера для locations:', data);
    
    // трансформируем структуру с сервера (name → value)
    const transformed = Array.isArray(data) 
      ? data.map(item => ({
          id: item.id,
          value: item.name || item.value || item.location_name || ''
        }))
      : [];
    
    return transformed;
  } catch (error) {
    console.error('Ошибка загрузки локаций:', error);
    const { LOCATIONS } = await import('./constants');
    return LOCATIONS;
  }
};

/**
 * Загрузить типы АСПТ с бекэнда
 * @param {Object} user - объект пользователя с username и password
 * @returns {Promise<Array>} Массив типов АСПТ
 */
export const fetchAsptTypes = async (user) => {
  try {
    const headers = makeHeaders(user);
    const response = await fetch(`${API_BASE_URL}/directories/aspt-models/`, { headers });
    if (!response.ok) throw new Error('Ошибка загрузки типов АСПТ');
    const data = await response.json();
    console.log('Ответ сервера для aspt-types:', data);
    const items = Array.isArray(data) ? data : [];
    // load full manufacturers list once
    let manufacturers = [];
    try {
      const mr = await fetch(`${API_BASE_URL}/directories/aspt-manufacturers/`, { headers });
      if (mr.ok) {
        const md = await mr.json();
        manufacturers = Array.isArray(md) ? md : md.results || [];
      }
    } catch (e) {
      // ignore manufacturer list load errors
    }

    const manufacturersMap = manufacturers.reduce((acc, m) => {
      acc[m.id] = m && (m.name || m.value) ? (m.name || m.value) : String(m.id);
      return acc;
    }, {});

    const transformed = items.map(item => {
      const manuf = manufacturersMap[item.manufacturer] || (item.manufacturer && String(item.manufacturer)) || '';
      const name = item.name || item.value || '';
      return {
        id: item.id,
        value: [manuf, name].filter(Boolean).join(' ').trim()
      };
    });

    return transformed;
  } catch (error) {
    console.error('Ошибка загрузки типов АСПТ:', error);
    const { ASPT_TYPES } = await import('./constants');
    return ASPT_TYPES;
  }
};

/**
 * Загрузить состояния АСПТ с бекэнда
 * @param {Object} user - объект пользователя с username и password
 * @returns {Promise<Array>} Массив состояний АСПТ
 */
export const fetchAsptStates = async (user) => {
  try {
    const headers = makeHeaders(user);
    const response = await fetch(`${API_BASE_URL}/aspt-states`, { headers });
    if (!response.ok) throw new Error('Ошибка загрузки состояний АСПТ');
    const data = await response.json();
    console.log('Ответ сервера для aspt-states:', data);
    
    const transformed = Array.isArray(data) 
      ? data.map(item => ({
          id: item.id,
          value: item.name || item.value || ''
        }))
      : [];
    
    return transformed;
  } catch (error) {
    console.error('Ошибка загрузки состояний АСПТ:', error);
    const { ASPT_STATES } = await import('./constants');
    return ASPT_STATES;
  }
};

/**
 * Загрузить исполнителей с бекэнда
 * @param {Object} user - объект пользователя с username и password
 * @returns {Promise<Array>} Массив исполнителей
 */
export const fetchExecutors = async (user) => {
  try {
    const headers = makeHeaders(user);
    const response = await fetch(`${API_BASE_URL}/executors`, { headers });
    if (!response.ok) throw new Error('Ошибка загрузки исполнителей');
    const data = await response.json();
    console.log('Ответ сервера для executors:', data);
    
    const transformed = Array.isArray(data) 
      ? data.map(item => ({
          id: item.id,
          value: item.name || item.value || ''
        }))
      : [];
    
    return transformed;
  } catch (error) {
    console.error('Ошибка загрузки исполнителей:', error);
    const { EXECUTORS } = await import('./constants');
    return EXECUTORS;
  }
};

/**
 * Загрузить все константы одновременно
 * @param {Object} user - объект пользователя с username и password
 * @returns {Promise<Object>} Объект со всеми константами
 */
export const fetchAllConstants = async (user) => {
  try {
    const [
      vehicleTypes,
      vehicleModels,
      locations,
      asptTypes,
      asptStates,
      executors
    ] = await Promise.all([
      fetchVehicleTypes(user),
      fetchVehicleModels(user),
      fetchLocations(user),
      fetchAsptTypes(user),
      fetchAsptStates(user),
      fetchExecutors(user)
    ]);

    return {
      vehicleTypes,
      vehicleModels,
      locations,
      asptTypes,
      asptStates,
      executors
    };
  } catch (error) {
    console.error('Ошибка загрузки констант:', error);
    // вернём локальные константы как fallback
    const {
      VEHICLE_TYPES,
      VEHICLE_MODELS,
      LOCATIONS,
      ASPT_TYPES,
      ASPT_STATES,
      EXECUTORS
    } = await import('./constants');
    
    return {
      vehicleTypes: VEHICLE_TYPES,
      vehicleModels: VEHICLE_MODELS,
      locations: LOCATIONS,
      asptTypes: ASPT_TYPES,
      asptStates: ASPT_STATES,
      executors: EXECUTORS
    };
  }
};
