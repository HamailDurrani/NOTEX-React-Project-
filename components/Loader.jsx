import React from 'react';
export default function Loader() {
    return (
        <div className="flex items-center justify-center w-full h-full p-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
        </div>
    );
}
