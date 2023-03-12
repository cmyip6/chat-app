import { Dispatch } from '@reduxjs/toolkit';
import { showNotification } from '@mantine/notifications';
import { PREFIX } from '../../store';
import { loginAction, logoutAction } from './slice';

export function login(username: string, password: string) {
    return async (dispatch: Dispatch) => {
        const res = await fetch(`${process.env.REACT_APP_API_SERVER}/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const result = await res.json()
        if (result.success) {
            const payload = {
                userId: result.userId,
                username: result.username,
                token: result.token
            }
            localStorage.setItem(`${PREFIX}token`, result.token);
            dispatch(loginAction(payload));
        } else {
            dispatch(logoutAction())
        }

        showNotification({
            title: 'Login notification',
            message: result.msg,
            autoClose: 2000,
        });

    };
}

export function signUp(username: string, password: string) {
    return async (dispatch: Dispatch) => {
        const res = await fetch(`${process.env.REACT_APP_API_SERVER}/auth/registration`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const result = await res.json()
        if (result.success) {
            const payload = {
                userId: result.userId,
                username: result.username,
                token: result.token
            }
            console.log(payload)
            localStorage.setItem(`${PREFIX}token`, result.token);
            dispatch(loginAction(payload));
        } else {
            logout()
        }
        showNotification({
            title: 'Login notification',
            message: result.msg,
            autoClose: 2000
        });
    };
}

export function logout() {
    return async (dispatch: Dispatch) => {
        localStorage.removeItem(`${PREFIX}token`);
        dispatch(logoutAction());
    };
}

export function retrieveLogin(token: string) {
    return async (dispatch: Dispatch) => {
        const res = await fetch(`${process.env.REACT_APP_API_SERVER}/auth/retrieveLogin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token
            })
        });
        const result = await res.json()
        
        if (result.success) {
            const payload = {
                userId: result.userId,
                username: result.username,
                token
            }
            dispatch(loginAction(payload));
        } else {
            logout();
        }
        showNotification({
            title: 'Login notification',
            message: result.msg,
            autoClose: 2000
        });
    }
}


