import { ColorSwatch, Container, Group, Input, Slider, Title, useMantineTheme } from '@mantine/core'
import React, { useState } from 'react'

export default function MessageColorControl() {
    const theme = useMantineTheme()
    const [value, setValue] = useState(1);

    const swatches = Object.keys(theme.colors).map((color) => (
        <ColorSwatch key={color} color={theme.fn.rgba(theme.colors[color][6], value)} />
    ));

    return (
        <Container className='col-6 d-flex flex-column gap-2 text-center'>
            <Title className='mb-2' order={5}>Message Control</Title>
            <Input.Wrapper label="Text Color and Opacity">
                <Slider
                    style={{ width: '70%', margin: "0 auto" }}
                    value={value}
                    label={(value)=> Math.round(value*10)}
                    min={0}
                    max={1}
                    step={0.1}
                    onChange={setValue} />
            </Input.Wrapper>

            <Group  position="center" spacing="xs">
                {swatches}
            </Group>

        </Container>
    )
}
