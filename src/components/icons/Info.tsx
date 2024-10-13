import React from 'react';

interface IconProps {
  width?: number;
  height?: number;
  fill?: string;
  onClick?: React.MouseEventHandler<SVGSVGElement>;
}

const InfoIcon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ width = 100, height = 100, fill = "#000", onClick }, ref) => {
    return (
      <svg
        ref={ref}
        width={width}
        height={height}
        fill="none"
        color={fill}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        className="icon icon-tabler icon-tabler-info-circle"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        onClick={onClick}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        <path stroke="none" d="M0 0h24v24H0z"></path>
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M12 8L12.01 8"></path>
        <path d="M11 12L12 12 12 16 13 16"></path>
      </svg>
    );
  }
);

export default InfoIcon;