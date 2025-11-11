'use client'

import * as React from 'react'

export function BlockquoteElement(props: any) {
	return (
		<blockquote
			{...props.attributes}
			className="my-4 border-l-4 border-muted-foreground/40 pl-4 italic text-muted-foreground"
		>
			{props.children}
		</blockquote>
	)
}


