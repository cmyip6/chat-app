import { CaseReducer, createSlice, PayloadAction } from '@reduxjs/toolkit';

type Contacts = {
    contactId: number, 
    nickname: string | undefined,
    contactUsername: string,
}

export type ContactsList = Contacts[]

export interface ContactState {
    contactsList: ContactsList | null
    checkUsername: boolean
    setTargetUser: number | null
    editTarget: number | null
}

const initialState: ContactState = {
    contactsList: null,
    checkUsername: false,
    setTargetUser: null,
    editTarget: null
};

const clearContactsList: CaseReducer<ContactState> = (state) => {
    state.contactsList = null;
};

const getContactsList: CaseReducer<ContactState, PayloadAction<ContactsList>> = (state, action) => {
    state.contactsList = action.payload;
};

const createContact: CaseReducer<ContactState, PayloadAction<Contacts>> = (state, action) => {
    state.contactsList?.push(action.payload);
};

const checkUsername: CaseReducer<ContactState, PayloadAction<boolean>> = (state, action) => {
    state.checkUsername = action.payload;
};

const setTargetUser: CaseReducer<ContactState, PayloadAction<number>> = (state, action) => {
    state.setTargetUser = action.payload;
};

const deleteContact: CaseReducer<ContactState, PayloadAction<number>> = (state, action) => {
    state.contactsList = state.contactsList!.filter(contact=> contact.contactId !== action.payload)
};

const setEditTarget: CaseReducer<ContactState, PayloadAction<number>> = (state, action) => {
    state.editTarget = action.payload;
};

const editContactName: CaseReducer<ContactState, PayloadAction<{contactId: number, editName: string}>> = (state, action) => {
    for (let contact of state.contactsList!){
        if (contact.contactId === action.payload.contactId){
            contact.nickname = action.payload.editName
        }
    }
};


const contactsSlice = createSlice({
    name: 'contacts',
    initialState,
    reducers: {
        clearContactsList,
        checkUsername,
        setTargetUser,
        getContactsList,
        createContact,
        deleteContact,
        setEditTarget,
        editContactName
    }
});

export const {
    clearContactsList: clearContactsListAction,
    checkUsername: checkUsernameAction,
    setTargetUser: setTargetUserAction,
    getContactsList: getContactsListAction,
    createContact: createContactAction,
    deleteContact: deleteContactAction,
    setEditTarget: setEditModeAction,
    editContactName: editContactNameAction
} = contactsSlice.actions;

export default contactsSlice.reducer;
