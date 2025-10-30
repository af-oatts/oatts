import { CompletionStatus, ContentState, CreateDefaultContentState } from '@/core/model/OattsModel';
import React, { useState, useCallback, useMemo } from 'react';
import { ContentStatesContext } from '../ContentStatesContext';
import User from '@/core/model/UserModel';
import { GetContentState } from '@/core/database/Content';

export function ContentStatesProvider({ children, user }: {
  children: React.ReactNode;
  user: User | undefined
}) {
  const [states, setStates] = useState<Map<string, ContentState>>(new Map());
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const updateContentStatus = useCallback((contentId: string, status: CompletionStatus) => {
    setStates(prev => {
      const newMap = new Map(prev);
      const existingState = newMap.get(contentId);
      if (existingState) {
        newMap.set(contentId, { ...existingState, completionStatus: status });
      } else {
        newMap.set(contentId, { ...CreateDefaultContentState(contentId), completionStatus: status })
      }
      return newMap;
    });
  }, []);

  const setContentState = useCallback((contentID: string, state: ContentState) => {
    setStates(prev => {
      const newMap = new Map(prev);
      newMap.set(contentID, state);
      return newMap;
    })
  }, []);

  // Non-async version that triggers loading in background
  const ensureContentStateLoaded = useCallback((contentId: string) => {
    // If already loaded or loading, do nothing
    if (states.has(contentId) || loadingIds.has(contentId)) {
      return;
    }

    if (!user) {
      console.error('Cannot fetch state for content ID ' + contentId + '. User is undefined!');
      return;
    }

    // Mark as loading
    setLoadingIds(prev => new Set(prev).add(contentId));

    // Load in background
    GetContentState(user, contentId).then(state => {
      if (state) {
        setContentState(contentId, state);
      }
      // Remove from loading set regardless of success/failure
      setLoadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(contentId);
        return newSet;
      });
    });
  }, [states, loadingIds, user, setContentState]);


  const removeContentState = useCallback((contentId: string) => {
    setStates(prev => {
      prev.delete(contentId);
      return prev;
    });
  }, []);

  const value = useMemo(() => ({
    _user: user,
    states,
    loadingIds,
    updateContentStatus,
    ensureContentStateLoaded,
    setContentState,
    removeContentState
  }), [states, loadingIds, updateContentStatus, ensureContentStateLoaded, setContentState]);

  return (
    <ContentStatesContext.Provider value={value}>
      {children}
    </ContentStatesContext.Provider>
  );
}