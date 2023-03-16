import { Divider } from '@mantine/core';
import { IconMenuOrder } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react'
import { PREFIX } from '../store';

export default function OptionPanel() {
    const savedSize = window.localStorage.getItem(`${PREFIX}optionHeight`)
    const [size, setSize] = useState((savedSize && parseInt(savedSize)) || 250);

    // save value after resizing
    useEffect(() => {
        window.localStorage.setItem(`${PREFIX}optionHeight`, size.toString())
    }, [size])

    // Side Panel resize
    const mouseDownHandler = (mouseDownEvent: React.MouseEvent) => {
        console.log(mouseDownEvent)
        mouseDownEvent.preventDefault()
        const startSize = size;
        const startPosition = mouseDownEvent.pageY;

        function onMouseMove(e: MouseEvent): void {
            const height = startSize + startPosition - e.pageY
            if(height< 100){
                setSize(30)
            } else {
                setSize(()=> height);
            }
        }

        function onMouseUp() {
            document.body.removeEventListener("mousemove", onMouseMove);
        }

        document.body.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp, { once: true });
    };

    return (
        <div style={{height: `${size}px`, minHeight: '30px'}}>
            <Divider 
                style={{margin:'0px'}} 
                labelPosition='center' 
                my='xs' 
                color={'lightgrey'} 
                label={<IconMenuOrder 
                    size={25}
                    color="#238BE6"
                    style={{cursor: 'pointer'}}
                    onClick={()=> size === 30? setSize(250) : null}
                    onMouseDown={mouseDownHandler}
                    />} 
                />
        </div>
    )
}
