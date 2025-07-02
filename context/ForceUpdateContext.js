import { createContext, useState } from 'react'

export const ForceUpdateContext = createContext()

export function ForceUpdateProvider({ children }) {
	const [trigger, setTrigger] = useState(0)

	const forceUpdate = () => setTrigger((prev) => prev + 1)

	return (
		<ForceUpdateContext.Provider value={{ trigger, forceUpdate }}>
			{children}
		</ForceUpdateContext.Provider>
	)
}
