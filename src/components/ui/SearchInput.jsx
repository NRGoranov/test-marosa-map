import React, { forwardRef } from 'react';
import SearchIcon from '../../assets/icons/SearchIcon';
import { SEARCH_PLACEHOLDER_BG } from '../../utils/searchConfig';

/**
 * Reusable search input component
 * 
 * @param {Object} props
 * @param {string} props.value - The input value
 * @param {Function} props.onChange - Change handler function: (event) => void
 * @param {string} props.className - Additional CSS classes for the input
 * @param {boolean} props.autoFocus - Whether to auto-focus the input
 * @param {string} props.iconClassName - Additional CSS classes for the search icon container
 * @param {React.ReactNode} props.children - Optional content to render after the input (e.g., clear button)
 */
function SearchInputComponent({ 
    value, 
    onChange, 
    className = '', 
    autoFocus = false,
    iconClassName = '',
    onFocus,
    onKeyDown,
    children
}, ref) {
    return (
        <>
            <div className={`absolute inset-y-0 left-0 flex items-center pointer-events-none ${iconClassName}`}>
                <SearchIcon />
            </div>
            
            <input
                ref={ref}
                type="text"
                value={value}
                onChange={onChange}
                onFocus={onFocus}
                onKeyDown={onKeyDown}
                autoFocus={autoFocus}
                placeholder={SEARCH_PLACEHOLDER_BG}
                className={className}
            />
            
            {children}
        </>
    );
}

const SearchInput = forwardRef(SearchInputComponent);
SearchInput.displayName = 'SearchInput';

export default SearchInput;
