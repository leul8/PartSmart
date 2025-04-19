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

  const clearSearch = () => {
    dispatch({ type: 'HAS_SEARCHED', payload: false });
    dispatch({ type: 'SEARCH', payload: [] });
  };

  const doSearch = async (term) => {
    dispatch({ type: 'HAS_SEARCHED', payload: true });
    setSearchLoading(true);
    await dispatch(searchAction(term, searchType));
    setSearchLoading(false);
  };

  const searchPost = async (e) => {
    if (e.key === 'Enter') {
      const term = input.trim();
      if (!term) {
        clearSearch();
      } else {
        await doSearch(term);
      }
    }
  };

  useEffect(() => {
    const term = input.trim();

    if (!term) {
      clearSearch();
      return;
    }

    const debounce = setTimeout(() => {
      doSearch(term);
    }, 500);

    return () => clearTimeout(debounce);
  }, [input, searchType]);

  return (
    <div className="relative w-full">
      <AiOutlineSearch className="absolute mt-2 ml-2 text-gray-500" />
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={searchPost}
        className="shadow border rounded-lg w-full py-[5px] px-3 pl-8 focus:outline-none bg-custom-white dark:bg-custom-dark"
        type="text"
        placeholder={t('Search')}
      />
      {searchLoading && input.trim() !== '' && (
        <div className="absolute right-2 top-[6px]">
          <div className="animate-spin h-4 w-4 border-t-2 border-blue-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
}

export default SearchBar;
