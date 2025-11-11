'use client'

import * as React from 'react'

// Minimal element renderers for headings with Tailwind styles.
// Plate will pass Slate element props; we forward attributes and children.

export function H1Element(props: any) {
	return (
		<h1
			{...props.attributes}
			className="mt-3 mb-2 text-3xl sm:text-4xl font-bold leading-tight text-foreground"
		>
			{props.children}
		</h1>
	)
}

export function H2Element(props: any) {
	return (
		<h2
			{...props.attributes}
			className="mt-3 mb-2 text-2xl sm:text-3xl font-semibold leading-snug text-foreground"
		>
			{props.children}
		</h2>
	)
}

export function H3Element(props: any) {
	return (
		<h3
			{...props.attributes}
			className="mt-2 mb-1.5 text-xl sm:text-2xl font-semibold leading-snug text-foreground"
		>
			{props.children}
		</h3>
	)
}


