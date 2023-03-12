import { CaseReducer, createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AuthState = {
    userId: number | null;
    isLoggedIn: boolean;
    username: string | null;
    token: string | null;
};

const initialState: AuthState = {
        userId: null,
        isLoggedIn: false,
        username: null,
        token: null
    }

const login: CaseReducer<AuthState, PayloadAction<{userId: number, username: string, token: string}>> = (state, action) => {
    state.userId = action.payload.userId
    state.username = action.payload.username
    state.token = action.payload.token
    state.isLoggedIn = true
};

const logout: CaseReducer<AuthState> = (state) => {
    state.userId = null
    state.username = null
    state.token = null
    state.isLoggedIn = false
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login,
        logout,
    }
});

export const { 
    login: loginAction,
    logout: logoutAction, 
    } = authSlice.actions;

export default authSlice.reducer;
