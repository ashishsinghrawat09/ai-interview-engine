import { useContext,useEffect } from "react";
import { useNavigate } from "react-router";

import { AuthContext } from "../auth.context.jsx";
import { login, register, logout, getMe } from "../services/auth.api.js";

export const useAuth = () => {
    const { user, setUser, loading, setLoading } = useContext(AuthContext);

    const navigate = useNavigate();

    const handleLogin = async (data) => {
        setLoading(true);

        try {
            const response = await login(data);

            setUser(response.user);

            navigate("/");
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (data) => {
        setLoading(true);

        try {
            const response = await register(data);

            setUser(response.user);

            navigate("/");
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoading(true);

        try {
            await logout();

            setUser(null);

            navigate("/login");
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleGetMe = async () => {
        try {
            const response = await getMe();

            setUser(response.user);
        } catch (error) {
            setUser(null);
        }
    };

    return {
        user,
        loading,
        handleLogin,
        handleRegister,
        handleLogout,
        handleGetMe,
    };
};