import { CompletionStatus, ContentState, CourseContent, DefaultContentState, OattsManifest } from '@/core/model/OattsModel';
import React, { useState, useCallback, useMemo } from 'react';
import { ContentStatesContext } from '../ContentStatesContext';
import User from '@/core/model/UserModel';
import { GetContentState } from '@/core/database/Content';

export function ContentStatesProvider({ children, user }: {
  children: React.ReactNode;
  user: User | undefined
}) {

  // Will be populated as necessary instead of all at once.
  const [states, setStates] = useState<Map<string, ContentState>>(new Map());


  const updateContentStatus = useCallback((contentId: string, status: CompletionStatus) => {

    setStates(prev => {
      const newMap = new Map(prev);
      const existingState = newMap.get(contentId);
      if (existingState) {
        newMap.set(contentId, { ...existingState, completionStatus: status });
      }
      else {
        newMap.set(contentId, { ...DefaultContentState, completionStatus: status })
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

  const getContentState = useCallback((contentId: string, noDbFetch?: boolean) => {
    return getOrLoadContentState(contentId, !!noDbFetch);
  }, [states]);

  // FIXME: There's a bit of a race condition here wherein multiple requests for the same content could result in multiple db lookups. Not a big deal but could be a thing to optimize in case load times are atrocious. 
  const getOrLoadContentState = async (id: string, noDbFetch: boolean) => {
    let state = states.get(id);
    if (state) {
      return state;
    }

    if(noDbFetch) {
      return undefined;
    }

    if(!user) {
      console.error('Cannot fetch state for content ID ' + id + '. User is undefined!');
      return undefined; 
    }
    state = await GetContentState(user, id);
    if(state) {
      setContentState(id, state); // Update so in the future we don't need to make the lookup.
    }
    return state;
  }

  const value = useMemo(() => ({
    states,
    updateContentStatus,
    getContentState,
    setContentState
  }), [states, updateContentStatus, getContentState, setContentState]);

  return (
    <ContentStatesContext.Provider value={value}>
      {children}
    </ContentStatesContext.Provider>
  );
}

function flattenContent(contents: CourseContent[]): CourseContent[] {
  let flat = [];
  for (let el of contents) {
    flat.push(el)
    if (el.children) {
      flat.push(...flattenContent(el.children))
    }
  }
  return flat
}