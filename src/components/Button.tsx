type ButtonPropos = {
    text?: string

}

export function Button (props: ButtonPropos) {
    return (
        <button>{props.text || 'Sem Texto'}</button>
    )

}