import React, { createContext, useEffect, useReducer } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

import cafeAPI from "../api/cafeApi";

import { Usuario, LoginResponse, LoginData, RegisterData } from '../interfaces/appInterfaces';
import { authReducer, AuthState } from './authReducer';

type AuthContextProps = {
    errorMessage: string;
    token: string | null;
    user: Usuario | null;
    status: 'checking' | 'authenticated' | 'not-authenticated';
    signUp: (user: RegisterData) => void;
    signIn: ( loginData: LoginData) => void;
    logOut: () => void;
    removeError: () => void;
}

const authInitialState: AuthState = {
    status: 'checking',
    token: null,
    user: null,
    errorMessage: ''
}

export const AuthContext = createContext({} as AuthContextProps);

export const AuthProvider = ({ children }: any) => {
    const [ state, dispatch ] = useReducer(authReducer, authInitialState);
    
    useEffect(() => {
       checkToken();
    }, [])
    
    const checkToken = async() => {
        const token = await AsyncStorage.getItem('token');
        
        if(!token){
            return dispatch({ type: 'notAuthenticated'});
        }
        
        const resp = await cafeAPI.get<LoginResponse>('/auth');
        
        if(resp.status !== 200){
            return dispatch({ type: 'notAuthenticated'});
        }
        
        await AsyncStorage.setItem('token', resp.data.token);
        
        dispatch({ 
            type: 'signUp', 
            payload: {
                token: resp.data.token,
                user: resp.data.usuario
            }
        })
        
        
    }
    
    const signIn = async({ correo, password }: LoginData) => {
        try {
            const { data } = await cafeAPI.post<LoginResponse>('/auth/login', {
                correo,
                password
            })
            dispatch({ 
                type: 'signUp', 
                payload: {
                    token: data.token,
                    user: data.usuario
                }
            })
            
            await AsyncStorage.setItem('token', data.token);
            
        } catch (error) {
            console.log(error.response.data.msg);
            dispatch({
                type: 'addError',
                payload: error.response.data.msg || 'Información incorrecta'
            })
        }
    };
    
    const signUp = async ({ nombre, correo, password }: RegisterData) => {
        try {
            const { data } = await cafeAPI.post<LoginResponse>('/usuarios', {
                nombre,
                correo,
                password
            })
            dispatch({ 
                type: 'signUp', 
                payload: {
                    token: data.token,
                    user: data.usuario
                }
            })
            
            await AsyncStorage.setItem('token', data.token);
            
        } catch (error) {
            dispatch({
                type: 'addError',
                payload: error.response.data.errors[0].msg || 'Información incorrecta'
            })
        }
    };
    
    const logOut = async() => {
        await AsyncStorage.removeItem('token');
        dispatch({
            type: 'logout',
        })
    };
    const removeError = () => {
        dispatch({
            type: 'removeError'
        });
    };
    
    return (
        <AuthContext.Provider value={{
            ...state,
            signUp,
            signIn,
            logOut,
            removeError,
        }}>
            { children }
        </AuthContext.Provider>
    )
}