import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import Sidebar from '../../components/owner/Sidebar';
import NavbarOwner from '../../components/owner/NavbarOwner';
import { useAppContext } from '../../context/AppContext';

const Layout = () => {
    const { isOwner } = useAppContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isOwner) {
            navigate('/');
        }
    }, [isOwner, navigate]);

    if (!isOwner) {
        return null;
    }

    return (
        <div className="flex flex-col">
            <NavbarOwner />

            <div className="flex">
                <Sidebar />

                <main className="flex-1">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;