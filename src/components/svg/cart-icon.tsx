import React from 'react';

export default function CartIcon({ className = '', ...props }: React.SVGProps<SVGSVGElement>) {
    return (
        <svg className={className} {...props} width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.72954 15C5.38048 15 3.70596 15 2.80624 13.9159C1.90652 12.8318 2.21511 11.1859 2.83231 7.89427C3.27123 5.55339 3.49068 4.38295 4.32386 3.69147C5.15703 3 6.34787 3 8.72954 3H9.27044C11.6521 3 12.8429 3 13.6761 3.69147C14.5092 4.38291 14.7287 5.55327 15.1676 7.8939L15.1677 7.89427C15.7849 11.1859 16.0934 12.8318 15.1937 13.9159C14.294 15 12.6195 15 9.27044 15H8.72954Z" stroke="currentColor" strokeWidth="1.125"/>
<path d="M6.87817 6C7.18705 6.87389 8.0205 7.5 9.00015 7.5C9.9798 7.5 10.8133 6.87389 11.1221 6" stroke="currentColor" strokeWidth="1.125" strokeLinecap="round"/>
</svg>
    );
}
