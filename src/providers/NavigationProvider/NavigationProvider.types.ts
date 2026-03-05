import type React from 'react';
import type { Endpoint } from '../../types/Endpoint/index.js';
import type { HistoryEntry } from '../../types/ResponseData/index.js';

export type Pane = 'navigator' | 'detail' | 'config';

export type DetailView = 'request' | 'response';

export type BodyEditMode = 'form' | 'json';

export interface NavigationContextValue {
	selectedIndex: number;
	setSelectedIndex: (index: number) => void;
	activePane: Pane;
	setActivePane: (pane: Pane) => void;
	selectedEndpoint: Endpoint | null;
	setSelectedEndpoint: (endpoint: Endpoint | null) => void;
	selectedFieldIndex: number;
	setSelectedFieldIndex: (index: number) => void;
	isEditing: boolean;
	setIsEditing: (editing: boolean) => void;
	activeView: DetailView;
	setActiveView: (view: DetailView) => void;
	paramValues: Record<string, string>;
	setParamValues: (values: Record<string, string>) => void;
	updateParamValue: (key: string, value: string) => void;
	bodyValue: string;
	setBodyValue: (value: string) => void;
	requestHistory: HistoryEntry[];
	addHistoryEntry: (entry: HistoryEntry) => void;
	bodyEditMode: BodyEditMode;
	setBodyEditMode: (mode: BodyEditMode) => void;
	bodyFieldValues: Record<string, string>;
	setBodyFieldValues: (values: Record<string, string>) => void;
	updateBodyFieldValue: (key: string, value: string) => void;
	bodyArrayItems: Record<string, string>[];
	setBodyArrayItems: (items: Record<string, string>[]) => void;
	currentBodyItemIndex: number;
	setCurrentBodyItemIndex: (index: number) => void;
	addBodyArrayItem: () => void;
	removeBodyArrayItem: (index: number) => void;
	updateBodyArrayItemField: (fieldName: string, value: string) => void;
	paramArrayItems: Record<string, string[]>;
	setParamArrayItems: (items: Record<string, string[]>) => void;
	currentParamArrayIndices: Record<string, number>;
	setCurrentParamArrayIndices: (indices: Record<string, number>) => void;
	addParamArrayItem: (paramName: string) => void;
	removeParamArrayItem: (paramName: string) => void;
	updateParamArrayItem: (paramName: string, value: string) => void;
	setParamArrayIndex: (paramName: string, index: number) => void;
	paramArrayRawMode: Record<string, boolean>;
	setParamArrayRawMode: (mode: Record<string, boolean>) => void;
	toggleParamArrayRawMode: (paramName: string) => void;
	fileInputMode: Record<string, 'browser' | 'path'>;
	setFileInputMode: (mode: Record<string, 'browser' | 'path'>) => void;
	toggleFileInputMode: (fieldName: string) => void;
	fieldEditorOverride: Record<string, boolean>;
	setFieldEditorOverride: (overrides: Record<string, boolean>) => void;
	toggleFieldEditorOverride: (fieldKey: string) => void;
}

export interface NavigationProviderProps {
	children: React.ReactNode;
}
