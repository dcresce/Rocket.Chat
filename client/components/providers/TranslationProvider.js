import React, { createContext, useContext, useMemo } from 'react';
import { TAPi18n, TAPi18next } from 'meteor/rocketchat:tap-i18n';

import { useReactiveValue } from '../../hooks/useReactiveValue';

const translate = (key) => key;

translate.has = () => true;

export const TranslationContext = createContext(translate);

const createContextValue = (language) => {
	const translate = (key, ...replaces) => {
		if (typeof replaces[0] === 'object') {
			const [options, lang_tag = language] = replaces;
			return TAPi18next.t(key, {
				ns: 'project',
				lng: lang_tag,
				...options,
			});
		}

		if (replaces.length === 0) {
			return TAPi18next.t(key, { ns: 'project', lng: language });
		}

		return TAPi18next.t(key, {
			postProcess: 'sprintf',
			sprintf: replaces,
			ns: 'project',
			lng: language,
		});
	};

	const has = (key, { lng = language, ...options } = {}) => !!key && TAPi18next.exists(key, { ...options, lng });

	translate.has = has;

	return {
		language,
		translate,
	};
};

export function TranslationProvider({ children }) {
	const language = useReactiveValue(() => TAPi18n.getLanguage());

	const contextValue = useMemo(() => createContextValue(language), [language]);

	return <TranslationContext.Provider value={contextValue}>
		{children}
	</TranslationContext.Provider>;
}

export const useTranslation = () => useContext(TranslationContext).translate;

export const useLanguage = () => useContext(TranslationContext).language;

export const useLanguages = () => useReactiveValue(() => {
	const languages = TAPi18n.getLanguages();

	const result = Object.entries(languages)
		.map(([key, language]) => ({ ...language, key: key.toLowerCase() }))
		.sort((a, b) => a.key - b.key);

	result.unshift({
		name: 'Default',
		en: 'Default',
		key: '',
	});

	return result;
}, []);
