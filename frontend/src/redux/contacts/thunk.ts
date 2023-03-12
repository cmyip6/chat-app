import { showNotification } from '@mantine/notifications';
import { Dispatch } from '@reduxjs/toolkit';
import { getState } from '../../store';
import { MakeRequest } from '../../utils/requestUtils';
import { checkUsernameAction, ContactsList, createContactAction, deleteContactAction, editContactNameAction, getContactsListAction, setTargetUserAction } from './slice';

const makeRequest = (token: string) => new MakeRequest(token);

export function checkUsername(value: string) {
    return async (dispatch: Dispatch) => {
        const token = getState().auth.token;
        const result = await makeRequest(token!).post<
            {
                value: string;
            },
            {
                success?: boolean;
                userId?: number;
                msg: string;
            }
        >(`/contacts/username`, {
            value
        });

        if (result.success) {
            dispatch(checkUsernameAction(true));
            dispatch(setTargetUserAction(result.userId!))
        } 
        showNotification({
            title: 'Username Format Notification',
            message: result.msg
        });
    };
}

export function createContact(nickname?: string) {
    return async (dispatch: Dispatch) => {
        const token = getState().auth.token;
        const owner = getState().auth.userId!;
        const user = getState().contacts.setTargetUser!
        const result = await makeRequest(token!).post<
            {
                nickname: string | undefined;
                owner: number;
                user: number;
            },
            {
                success?: boolean;
                contactId?: number;
                contactUsername: string
                msg: string;
            }
        >(`/contacts/`, {
            owner,
            user,
            nickname
        });

        if (result.success) {
            const payload = {
                contactId: result.contactId!,
                nickname: nickname,
                contactUsername: result.contactUsername
            }
            dispatch(createContactAction(payload));
            dispatch(setTargetUserAction(0))
        } 
        showNotification({
            title: 'Create Contact Notification',
            message: result.msg
        });
    };
}

export function getContactList(userId: number) {
    return async (dispatch: Dispatch) => {
        const token = getState().auth.token;
        const result = await makeRequest(token!).get<
            {
                success?: boolean;
                contactsList: ContactsList;
                msg: string;
            }
        >(`/contacts/${userId}`);

        if (result.success) {
            dispatch(getContactsListAction(result.contactsList))
            console.log(result.msg)
        } else {
            showNotification({
                title: 'Get Contact List Notification',
                message: result.msg
            });
        }
    };
}

export function deleteContact(contactId: number) {
    return async (dispatch: Dispatch) => {
        const token = getState().auth.token;
        const result = await makeRequest(token!).delete<
            {
                contactId: number
            },
            {
                success?: boolean;
                msg: string;
            }
        >(`/contacts/`, {contactId});

        if (result.success) {
            dispatch(deleteContactAction(contactId))
        } 
        showNotification({
            title: 'Contact List Notification',
            message: result.msg
        });
    };
}

export function editContactName(contactId: number, editName: string) {
    return async (dispatch: Dispatch) => {
        const token = getState().auth.token;
        const result = await makeRequest(token!).put<
            {
                contactId: number
                editName: string
            },
            {
                success?: boolean;
                msg: string;
            }
        >(`/contacts/`, {contactId, editName});

        if (result.success) {
            dispatch(editContactNameAction({contactId, editName}))
        } else {
            showNotification({
                title: 'Contact List Notification',
                message: result.msg
            });
        }
    };
}