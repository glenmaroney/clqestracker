const axios = require('axios')

const initialState = {
    isLoading: false,
    error: false,
    selectedPackage: 0,
    selectedPackageName: 'All',
    hypothesesList: [],
    CRList: [],
    WPList: [],
    userData: [],
    //Drop Downs
    WBSList: [],
    //Analytics
    Data: [],
    //Summary
    Baseline: 0,
    HypVal: 0,
    CRVal: 0,
    //Approved Packages
    ApprovedPackages: []
}

const UPDATE_PACKAGE = 'UPDATE_PACKAGE'
const GET_ALL_CRS = 'GET_ALL_CRS'
const GET_HYPOTHESES = 'GET_HYPOTHESES'
const GET_ALL_HYPOTHESES = 'GET_ALL_HYPOTHESES'
const GET_WP = 'GET_WP'
const GET_USER = 'GET_USER'
const RESET_STORE = 'RESET_STORE'
const EDIT_PASSWORD = 'EDIT_PASSWORD'
const GET_WBS = 'GET_WBS'
const GET_ANALYTICS = 'GET_ANALYTICS'
const GET_BASELINE_VAL = 'GET_BASELINE_VAL'
const GET_HYP_VAL = 'GET_HYP_VAL'
const GET_CR_VAL = 'GET_CR_VAL'
const GET_PACKAGES = 'GET_PACKAGES'



//Action Creators
export function getUser(userObj) {
    //Dont want all the data here, as its stored in the browser via redux persist. (Deconstruct first!)
    const userDataToStore = {}
    userDataToStore.Name = userObj.Name
    userDataToStore.Email = userObj.Email
    userDataToStore.PersonID = userObj.PersonID
    userDataToStore.ACM = userObj.ACM
    userDataToStore.Lead = userObj.Lead
    return {
        type: GET_USER,
        payload: userDataToStore
    }
}

export function resetStore() {
    return {
        type: RESET_STORE
    }
}

export function editPassword(email, txtPassword) {
    return {
        type: EDIT_PASSWORD,
        payload: axios.put(`/api/editPassword/${email}`, { pw: txtPassword })
            .then(res => {
                return res.data.recordsets[0]
            })
    }
}

export function getApprovedPackages(PersonID) {
    return {
        type: GET_PACKAGES,
        payload: axios.get(`/api/getApprovedPackages/${PersonID}`)
            .then(res => {
                return res.data.recordsets[0]
            })
    }
}

export function getHypotheses(id) {
    return {
        type: GET_HYPOTHESES,
        payload: axios.get(`/api/getAllHypothesesByPackage/${id}`).then(res => {
            return res.data.recordsets[0]
        })
    }
}

export function getAllHypotheses() {
    return {
        type: GET_ALL_HYPOTHESES,
        payload: axios.get(`/api/getAllHypotheses`).then(res => {
            return res.data.recordsets[0]
        })
    }
}

export function getCRs(id) {
    return {
        type: GET_ALL_CRS,
        payload: axios.get(`/api/getAllCRsByPackage/${id}`).then(res => {
            return res.data.recordsets[0]
        })
    }
}

export function getAllCRs() {
    return {
        type: GET_ALL_CRS,
        payload: axios.get(`/api/getAllCRs`).then(res => {
            return res.data.recordsets[0]
        })
    }
}

export function getWPs(id) {
    return {
        type: GET_WP,
        payload: axios.get(`/api/getAllWPsByPackage/${id}`).then(res => {
            return res.data.recordsets[0]
        })
    }
}

export function getAllWPsByCRID(id) {
    return {
        type: GET_WP,
        payload: axios.get(`/api/getAllWPsByCRID/${id}`).then(res => {
            return res.data.recordsets[0]
        })
    }
}

export function getAllWPsByHyp(id) {
    return {
        type: GET_WP,
        payload: axios.get(`/api/getAllWPsByHyp/${id}`).then(res => {
            return res.data.recordsets[0]
        })
    }
}

export function getAllWPs() {
    return {
        type: GET_WP,
        payload: axios.get(`/api/getAllWP`).then(res => {
            return res.data.recordsets[0]
        })
    }
}

export function updatePackage(id, name) {
    return {
        type: UPDATE_PACKAGE,
        payload: id,
        payload2: name
    }
}


//Analytics
export function getAnalyticsAll() {
    return {
        type: GET_ANALYTICS,
        payload: axios.get('/api/getAnalytics').then(res => {
            return res.data.recordsets[0]
        })
    }
}

export function getAnalyticsByPackage(id) {
    return {
        type: GET_ANALYTICS,
        payload: axios.get(`/api/getAnalyticsByPackage/${id}`).then(res => {
            return res.data.recordsets[0]
        })
    }
}

//Summary
export function getAllBaseline() {

    return {
        type: GET_BASELINE_VAL,
        payload: axios.get(`/api/getAllBaseline`).then(res => {
            return res.data.recordsets[0]
        })
    }
}

export function getBaseline(id) {
    return {
        type: GET_BASELINE_VAL,
        payload: axios.get(`/api/getBaseline/${id}`).then(res => {
            return res.data.recordsets[0]
        })
    }
}

export function getAllHypVal() {
    return {
        type: GET_HYP_VAL,
        payload: axios.get(`/api/getAllHypVal`).then(res => {
            return res.data.recordsets[0]
        })
    }
}

export function getHypVal(id) {
    return {
        type: GET_HYP_VAL,
        payload: axios.get(`/api/getHypVal/${id}`).then(res => {
            return res.data.recordsets[0]
        })
    }
}

export function getAllCRVal() {
    return {
        type: GET_CR_VAL,
        payload: axios.get(`/api/getAllCRsRaised`).then(res => {
            return res.data.recordsets[0]
        })
    }
}

export function getCRVal(id) {
    return {
        type: GET_CR_VAL,
        payload: axios.get(`/api/getCRsRaised/${id}`).then(res => {
            return res.data.recordsets[0]
        })
    }
}

//DropDowns
export function getWBSList() {
    return {
        type: GET_WBS,
        payload: axios.get('/api/getWBS').then(res => {
            return res.data.recordsets[0]
        })
    }
}

//Reducer
export default function reducer(state = initialState, action) {
    switch (action.type) {
        case UPDATE_PACKAGE:
            return Object.assign({}, state, { selectedPackage: action.payload, selectedPackageName: action.payload2[0] })

        case GET_USER:
        console.log(action.payload)
            return Object.assign({}, state, { userData: action.payload, isLoading: false })

        case RESET_STORE:
            return state = initialState

        case EDIT_PASSWORD + '_PENDING':
            return Object.assign({}, state, { isLoading: true })
        case EDIT_PASSWORD + '_FULFILLED':
            return Object.assign({}, state, { userData: action.payload[0], isLoading: false })
        case EDIT_PASSWORD + '_REJECTED':
            return Object.assign({}, state, { isError: true, isLoading: false })

        case GET_PACKAGES + '_PENDING':
            return Object.assign({}, state, { isLoading: true })
        case GET_PACKAGES + '_FULFILLED':
            return Object.assign({}, state, { ApprovedPackages: action.payload, isLoading: false })
        case GET_PACKAGES + '_REJECTED':
            return Object.assign({}, state, { isError: true, isLoading: false })

        case GET_HYPOTHESES + '_PENDING':
            return Object.assign({}, state, { isLoading: true })
        case GET_HYPOTHESES + '_FULFILLED':
            return Object.assign({}, state, { hypothesesList: action.payload, isLoading: false })
        case GET_HYPOTHESES + '_REJECTED':
            return Object.assign({}, state, { error: true, isLoading: false })

        case GET_ALL_HYPOTHESES + '_PENDING':
            return Object.assign({}, state, { isLoading: true })
        case GET_ALL_HYPOTHESES + '_FULFILLED':
            return Object.assign({}, state, { hypothesesList: action.payload, isLoading: false })
        case GET_ALL_HYPOTHESES + '_REJECTED':
            return Object.assign({}, state, { error: true, isLoading: false })

        case GET_ALL_CRS + '_PENDING':
            return Object.assign({}, state, { isLoading: true })
        case GET_ALL_CRS + '_FULFILLED':
            return Object.assign({}, state, { CRList: action.payload, isLoading: false })
        case GET_ALL_CRS + '_REJECTED':
            return Object.assign({}, state, { error: true, isLoading: false })

        case GET_WP + '_PENDING':
            return Object.assign({}, state, { isLoading: true })
        case GET_WP + '_FULFILLED':
            return Object.assign({}, state, { WPList: action.payload, isLoading: false })
        case GET_WP + '_REJECTED':
            return Object.assign({}, state, { error: true, isLoading: false })

        case GET_WBS + '_PENDING':
            return Object.assign({}, state, { isLoading: true })
        case GET_WBS + '_FULFILLED':
            let newArr = []
            let WBS = action.payload.map((e) => {
                newArr.push({ key: e.WBSID, value: e.WBSID, text: e.L4 })
            })
            return Object.assign({}, state, { WBSList: newArr, isLoading: false })

        case GET_WBS + '_REJECTED':
            return Object.assign({}, state, { error: true, isLoading: false })

        case GET_ANALYTICS + '_PENDING':
            return Object.assign({}, state, { isLoading: true })
        case GET_ANALYTICS + '_FULFILLED':
            return Object.assign({}, state, { Data: action.payload, isLoading: false })
        case GET_ANALYTICS + '_REJECTED':
            return Object.assign({}, state, { error: true, isLoading: false })

        case GET_BASELINE_VAL + '_PENDING':
            return Object.assign({}, state, { isLoading: true })
        case GET_BASELINE_VAL + '_FULFILLED':
            return Object.assign({}, state, { Baseline: action.payload[0].total, isLoading: false })
        case GET_BASELINE_VAL + '_REJECTED':
            return Object.assign({}, state, { error: true, isLoading: false })

        case GET_HYP_VAL + '_PENDING':
            return Object.assign({}, state, { isLoading: true })
        case GET_HYP_VAL + '_FULFILLED':
            return Object.assign({}, state, { HypVal: action.payload[0].total, isLoading: false })
        case GET_HYP_VAL + '_REJECTED':
            return Object.assign({}, state, { error: true, isLoading: false })

        case GET_CR_VAL + '_PENDING':
            return Object.assign({}, state, { isLoading: true })
        case GET_CR_VAL + '_FULFILLED':
            return Object.assign({}, state, { CRVal: action.payload[0].total, isLoading: false })
        case GET_CR_VAL + '_REJECTED':
            return Object.assign({}, state, { error: true, isLoading: false })

        default:
            return state;
    }
}
