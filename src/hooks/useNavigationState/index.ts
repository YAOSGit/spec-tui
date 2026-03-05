import { useCallback, useState } from 'react';
import type { BodyEditMode, DetailView, Pane } from '../../providers/NavigationProvider/NavigationProvider.types.js';
import type { Endpoint } from '../../types/Endpoint/index.js';
import type { HistoryEntry } from '../../types/ResponseData/index.js';

const MAX_HISTORY = 50;

export const useNavigationState = () => {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [activePane, setActivePane] = useState<Pane>('navigator');
	const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint | null>(
		null,
	);
	const [selectedFieldIndex, setSelectedFieldIndex] = useState(0);
	const [isEditing, setIsEditing] = useState(false);
	const [activeView, setActiveView] = useState<DetailView>('request');
	const [paramValues, setParamValues] = useState<Record<string, string>>({});
	const [bodyValue, setBodyValue] = useState('');

	const [requestHistory, setRequestHistory] = useState<HistoryEntry[]>([]);
	const [bodyEditMode, setBodyEditMode] = useState<BodyEditMode>('form');
	const [bodyFieldValues, setBodyFieldValues] = useState<Record<string, string>>({});

	// Array body multi-item state
	const [bodyArrayItems, setBodyArrayItems] = useState<Record<string, string>[]>([{}]);
	const [currentBodyItemIndex, setCurrentBodyItemIndex] = useState(0);

	// Param array multi-item state (per-param)
	const [paramArrayItems, setParamArrayItems] = useState<Record<string, string[]>>({});
	const [currentParamArrayIndices, setCurrentParamArrayIndices] = useState<Record<string, number>>({});
	const [paramArrayRawMode, setParamArrayRawMode] = useState<Record<string, boolean>>({});

	const [fileInputMode, setFileInputMode] = useState<Record<string, 'browser' | 'path'>>({});
	const toggleFileInputMode = useCallback((fieldName: string) => {
		setFileInputMode((prev) => ({
			...prev,
			[fieldName]: (prev[fieldName] ?? 'browser') === 'browser' ? 'path' : 'browser',
		}));
	}, []);

	const [fieldEditorOverride, setFieldEditorOverride] = useState<Record<string, boolean>>({});
	const toggleFieldEditorOverride = useCallback((fieldKey: string) => {
		setFieldEditorOverride((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
	}, []);

	const updateParamValue = useCallback((key: string, value: string) => {
		setParamValues((prev) => ({ ...prev, [key]: value }));
	}, []);

	const addHistoryEntry = useCallback((entry: HistoryEntry) => {
		setRequestHistory((prev) => [entry, ...prev].slice(0, MAX_HISTORY));
	}, []);

	const updateBodyFieldValue = useCallback((key: string, value: string) => {
		setBodyFieldValues((prev) => ({ ...prev, [key]: value }));
	}, []);

	const addBodyArrayItem = useCallback(() => {
		setBodyArrayItems((prev) => {
			const next = [...prev, {}];
			setCurrentBodyItemIndex(next.length - 1);
			return next;
		});
	}, []);

	const removeBodyArrayItem = useCallback((index: number) => {
		setBodyArrayItems((prev) => {
			if (prev.length <= 1) return prev;
			const next = prev.filter((_, i) => i !== index);
			setCurrentBodyItemIndex((cur) => Math.min(cur, next.length - 1));
			return next;
		});
	}, []);

	const addParamArrayItem = useCallback((paramName: string) => {
		setParamArrayItems((prev) => {
			const items = prev[paramName] ?? [''];
			const next = { ...prev, [paramName]: [...items, ''] };
			setCurrentParamArrayIndices((ci) => ({ ...ci, [paramName]: items.length }));
			return next;
		});
	}, []);

	const removeParamArrayItem = useCallback((paramName: string) => {
		setCurrentParamArrayIndices((ci) => {
			const cur = ci[paramName] ?? 0;
			setParamArrayItems((prev) => {
				const items = prev[paramName] ?? [''];
				if (items.length <= 1) return prev;
				return {
					...prev,
					[paramName]: items.filter((_, i) => i !== cur),
				};
			});
			return { ...ci, [paramName]: Math.min(cur, Math.max(0, cur - 1)) };
		});
	}, []);

	const updateParamArrayItem = useCallback((paramName: string, value: string) => {
		setCurrentParamArrayIndices((ci) => {
			const idx = ci[paramName] ?? 0;
			setParamArrayItems((prev) => {
				const items = [...(prev[paramName] ?? [''])];
				items[idx] = value;
				return { ...prev, [paramName]: items };
			});
			return ci;
		});
	}, []);

	const setParamArrayIndex = useCallback((paramName: string, index: number) => {
		setCurrentParamArrayIndices((prev) => ({ ...prev, [paramName]: index }));
	}, []);

	const toggleParamArrayRawMode = useCallback((paramName: string) => {
		setParamArrayRawMode((prev) => {
			const isRaw = prev[paramName] ?? false;
			if (!isRaw) {
				// Multi-item → raw: join items into comma-separated paramValues
				const items = paramArrayItems[paramName] ?? [''];
				const csv = items.filter((s) => s !== '').join(', ');
				setParamValues((pv) => ({ ...pv, [paramName]: csv }));
			} else {
				// Raw → multi-item: split paramValues into array items
				const csv = paramValues[paramName] ?? '';
				const items = csv.split(',').map((s) => s.trim()).filter((s) => s !== '');
				setParamArrayItems((pa) => ({
					...pa,
					[paramName]: items.length > 0 ? items : [''],
				}));
				setCurrentParamArrayIndices((ci) => ({ ...ci, [paramName]: 0 }));
			}
			return { ...prev, [paramName]: !isRaw };
		});
	}, [paramArrayItems, paramValues]);

	const updateBodyArrayItemField = useCallback((fieldName: string, value: string) => {
		setCurrentBodyItemIndex((curIdx) => {
			setBodyArrayItems((prev) => {
				const updated = [...prev];
				updated[curIdx] = { ...updated[curIdx], [fieldName]: value };
				return updated;
			});
			return curIdx;
		});
	}, []);

	return {
		selectedIndex,
		setSelectedIndex,
		activePane,
		setActivePane,
		selectedEndpoint,
		setSelectedEndpoint,
		selectedFieldIndex,
		setSelectedFieldIndex,
		isEditing,
		setIsEditing,
		activeView,
		setActiveView,
		paramValues,
		setParamValues,
		updateParamValue,
		bodyValue,
		setBodyValue,
		requestHistory,
		addHistoryEntry,
		bodyEditMode,
		setBodyEditMode,
		bodyFieldValues,
		setBodyFieldValues,
		updateBodyFieldValue,
		bodyArrayItems,
		setBodyArrayItems,
		currentBodyItemIndex,
		setCurrentBodyItemIndex,
		addBodyArrayItem,
		removeBodyArrayItem,
		updateBodyArrayItemField,
		paramArrayItems,
		setParamArrayItems,
		currentParamArrayIndices,
		setCurrentParamArrayIndices,
		addParamArrayItem,
		removeParamArrayItem,
		updateParamArrayItem,
		setParamArrayIndex,
		paramArrayRawMode,
		setParamArrayRawMode,
		toggleParamArrayRawMode,
		fileInputMode,
		setFileInputMode,
		toggleFileInputMode,
		fieldEditorOverride,
		setFieldEditorOverride,
		toggleFieldEditorOverride,
	};
};
