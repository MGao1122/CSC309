import React from 'react';

type TagProps = {
    name: string;
};

const Tag: React.FC<TagProps> = ({ name }) => {
    return (
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-200 text-gray-800 text-sm font-medium">
            {name}
        </span>
    );
};

export default Tag;
