import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AiOutlineSearch } from 'react-icons/ai';
import { searchAction } from '../redux/actions/search';
import { useTranslation } from 'react-i18next';

function SearchBar({ searchType }) { 
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const searchPost = async (e) => {
    if (e.key === 'Enter') {
      if (input.trim() === '') {
        setIsSearching(false);
        dispatch({ type: 'SEARCH', payload: [] });
        return;
      }
      setIsSearching(true);
      await dispatch(searchAction(input, searchType)); 
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (input.trim() === '') return;

    setSearchLoading(true);

    const debounce = setTimeout(async () => {
      await dispatch(searchAction(input, searchType)); 
      setSearchLoading(false);
    }, 500);

    return () => clearTimeout(debounce);
  }, [input, searchType, dispatch]);

  return (
    <div className="relative w-full">
      <AiOutlineSearch className="absolute mt-2 ml-2" />
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={searchPost}
        className="shadow appearance-none border border-gray-400 dark:border-gray-500 rounded-lg w-full py-[5px] px-3 leading-tight focus:outline-none focus:shadow-outline bg-custom-white dark:bg-custom-dark dark:shadow-gray-700 pl-8"
        type="text"
        placeholder={t('Search')}
      />
      {searchLoading && input.trim() !== '' && (
        <div className="absolute right-2 top-[6px]">
          <div className="animate-spin h-4 w-4 border-t-2 border-blue-500 border-solid rounded-full"></div>
        </div>
      )}
    </div>
  );
}

export default SearchBar;
