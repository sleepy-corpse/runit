import classes from './Button.module.css';
import React, { memo, useEffect, useState } from 'react';
import { useButton } from './hooks';
import { useDispatch } from 'react-redux';
import { useAuth } from '../../hooks';
import { useSnippets } from '../../hooks';

import { actions as modalActions } from '../../slices/modalSlice.js';

export const Button = memo(() => {
  const { onClick, disabled, update } = useButton();
  const [currentSnippetId, setCurrentSnippetId] = useState();
  const dispatch = useDispatch();
  const auth = useAuth();
  const snippetsApi = useSnippets();

  useEffect(() => {
    if (snippetsApi.hasSnippetParams()) {
      const decodedId = snippetsApi.getSnippetIdFromParams();
      setCurrentSnippetId(decodedId);
    } else {
      setCurrentSnippetId(false);
    }
  }, []);

  const getTypeOfModal = (isLoggedIn) => {
    return isLoggedIn
      ? { type: 'sharingRepl', item: null }
      : { type: 'gettingInfo' };
  };

  const handleShareEvent = async () => {
    if (!snippetsApi.hasSnippetParams()) {
      dispatch(modalActions.openModal(getTypeOfModal(auth.isLoggedIn)));
    } else {
      if (!auth.isLoggedIn) {
        dispatch(modalActions.openModal({ type: 'gettingInfo' }));
      } else {
        const decodedId = snippetsApi.getSnippetIdFromParams();
        const snippetData = await snippetsApi.getSnippetData(decodedId);
        const snippetName = snippetData.name;
        dispatch(
          modalActions.openModal({
            type: 'sharingRepl',
            item: {
              name: snippetName,
              link: snippetsApi.genSnippetLink(snippetsApi.encodeId(decodedId)),
            },
          }),
        );
      }
    }
  };

  return (
    <div className={`text-center ${classes.container}`}>
      <button
        type="button"
        className={`btn btn-success btn-lg ${classes.runButton}`}
        disabled={disabled}
        onClick={() => {
          onClick();
          update(currentSnippetId);
        }}
      >
        Run
      </button>
      <button
        type="button"
        className={`btn btn-primary btn-lg ${classes.shareButton}`}
        onClick={handleShareEvent}
      >
        Share
      </button>
    </div>
  );
});
