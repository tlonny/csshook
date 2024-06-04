# csshook

<div align="center">
    <img src="logo.png">
</div>

## Summary

`csshook` is a minimal, lightweight, dependency-free library that allows for effortless inline styling of React components using hooks.

```typescript
import { style } from "csshook"

const redBackgroundStyleTemplate = (cls) => `
    .${cls} { background: red; }
`

const paddingStyleTemplate = (cls, params : {padding: number}) => `
    .${cls} { padding: ${padding}px; }
`

const useComponentStyle = style((cls, params : {padding : number}) => [
    redBackgroundStyleTemplate(cls), paddingStyleTemplate(cls, params)
].join("\n"))


const MyComponent = () => {
    const className = useComponentStyle({ padding : 5 })
    return createElement("div", { className }, "Hello!")
}
```

## Installation

```bash
yarn add csshook
```

## Usage

`csshook` exposes a singld `style` function. This method is used to construct `StyleGenerator` hooks that in turn provide React components with styled CSS classes.

To create a `StyleGenerator` hook, we must pass a `StyleTemplate` to the `style` function. A `StyleTemplate` is simply a generic function that takes a CSS class name, and some styling parameters (`T extends object`) and returns a valid fragment of CSS.

By exposing the CSS class as an argument to the `StyleTemplate` we can trivially implement stuff like pseudoselectors, media queries etc!

Here is an example `StyleTemplate<{ background: string }>`, that shows the use of media queries and pseuoselectors:

```typescript
const backgroundStyleTemplate = (cls : string, params = { background : string }) => `
    .${cls} { background: black; }
    @media (min-width: 500px) {
        .${cls}:hover { background: ${background}; }
    }
`
```

We then wrap this `StyleTemplate` in the `style` function to create a hook that can be called from within React components.

```typescript
import { style } from "csshook"
const useBackgroundStyle = style(backgroundStyleTemplate)
```

If we wish to style a div with a certain background color we can now do the following, from within the component:

```typescript
const Component = () => {
    const className = useBackgroundStyle({ background: "cyan" })
    return createElement("div", { className }, "Styled Div!")
}
```

And thats it! `csshook` will generate a unique CSS class for the CSS fragment, append it to the DOM and expose said class to the React component for consumption. `csshook` will ensure that identical CSS fragments resolve to the same CSS class, further, it will remove unused `<style>` nodes from the DOM when they are no longer in use.