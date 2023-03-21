import { Divider, useMantineTheme } from '@mantine/core'
import { IconCaretUp, IconMenuOrder } from '@tabler/icons-react'
import React, { useEffect, useState } from 'react'
import { PREFIX } from '../store'
import MessageColorControl from './MessageColorControl'
import ThemeControl from './ThemeControl'

export default function OptionPanel() {
	const savedSize = window.localStorage.getItem(`${PREFIX}optionHeight`)
	const [size, setSize] = useState((savedSize && parseInt(savedSize)) || 550)
	const theme = useMantineTheme()

	// save value after resizing
	useEffect(() => {
		window.localStorage.setItem(`${PREFIX}optionHeight`, size.toString())
	}, [size])

	// Side Panel resize
	const mouseDownHandler = (mouseDownEvent: React.MouseEvent) => {
		mouseDownEvent.preventDefault()
		const startSize = size
		const startPosition = mouseDownEvent.pageY

		function onMouseMove(e: MouseEvent): void {
			const height = startSize + startPosition - e.pageY
			if (height < 100) {
				setSize(20)
			} else {
				setSize(height)
			}
		}

		function onMouseUp() {
			document.body.removeEventListener('mousemove', onMouseMove)
		}

		document.body.addEventListener('mousemove', onMouseMove)
		window.addEventListener('mouseup', onMouseUp, { once: true })
	}

	return (
		<div
			style={{
				height: `${size}px`,
				minHeight: '20px',
				overflow: 'hidden',
				visibility: `${size <= 100 ? 'hidden' : 'visible'}`
			}}
		>
			<Divider
				style={{ margin: '0px' }}
				labelPosition='center'
				my='xs'
				label={
					<span
						id='option-panel-resize-icon'
						style={{ cursor: 'pointer' }}
						onClick={() =>
							size >= 100
								? setSize(20)
								: size === 20
								? setSize(550)
								: null
						}
						onMouseDown={mouseDownHandler}
					>
						{size === 20 ? (
							<IconCaretUp
								size={35}
								style={{ marginTop: '-10px' }}
								color={theme.primaryColor}
							/>
						) : (
							<IconMenuOrder
								size={25}
								color={theme.primaryColor}
							/>
						)}
					</span>
				}
			/>
			<div className='row'>
				<ThemeControl />
				<MessageColorControl />
			</div>
		</div>
	)
}
