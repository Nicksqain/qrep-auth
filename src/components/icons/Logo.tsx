import React from 'react';

interface IconProps {
  width?: number;
  height?: number;
  fill?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
}

const LogoIcon: React.FC<IconProps> = ({ width = 100, height = 100, fill = "#000", onClick }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 30 40"
      xmlns="http://www.w3.org/2000/svg"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <path
        d="M0 24.1921V3.91681L3.91681 0H14.5152L18.432 3.91681V7.37282H21.4272L25.3441 11.2896V27.1873L21.8903 30.6433L26.0562 40H20.5076L15.97 29.8083L20.736 25.3441V13.3632L19.3536 11.9808H11.52V20.736H6.91202V7.37282H13.824V5.99041L12.4416 4.60801H5.99041L4.60801 5.99041V22.1185L5.99041 23.5009H12.4416L13.824 22.1185V14.7456H18.432V24.1921L14.5152 28.1089H11.8015L14.7175 34.6583H10.0906L7.1746 28.1089H3.91681L0 24.1921Z"
        fill={fill}
      />
    </svg>
  );
};

export default LogoIcon;