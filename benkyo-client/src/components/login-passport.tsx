import useAuthStore from '@/hooks/use-auth-store';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const LoginPassport = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setUser, setToken } = useAuthStore();
    useEffect(() => {
        const token = searchParams.get('token');
        const id = searchParams.get('id');
        const email = searchParams.get('email');
        const name = searchParams.get('name');
        if (token && id && email && name) {
            setUser({ _id: id, email, username: name });
            setToken(token);
            navigate('/home', { replace: true });
        }
    }, [searchParams, navigate]);
    return <div>LoginPassport</div>;
};

export default LoginPassport;
