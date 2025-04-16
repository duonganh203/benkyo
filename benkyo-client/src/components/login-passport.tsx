import useAuthStore from '@/hooks/stores/use-auth-store';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const LoginPassport = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser, setToken, setRefreshToken } = useAuthStore();
    useEffect(() => {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');
        const id = searchParams.get('id');
        const email = searchParams.get('email');
        const name = searchParams.get('name');
        const avatar = searchParams.get('avatar');
        const isPro = searchParams.get('isPro');
        if (token && refreshToken && id && email && name && avatar && isPro) {
            setUser({ _id: id, email, username: name, avatar: avatar, isPro: isPro == 'true' ? true : false });
            setToken(token);
            setRefreshToken(refreshToken);
            navigate('/home', { replace: true });
        }
    }, [searchParams, navigate]);
    return <div>LoginPassport</div>;
};

export default LoginPassport;
