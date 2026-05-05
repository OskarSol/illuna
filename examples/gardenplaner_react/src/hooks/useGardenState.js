import { useEffect, useState } from 'react';
import { loadGardenState, STORAGE_KEY } from '../lib/gardenState';

export function useGardenState() {
  const [state, setState] = useState(loadGardenState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return [state, setState];
}
