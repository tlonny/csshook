import { useLayoutEffect, useState } from "react"

type EmptyObject = { [key: string] : never }
export type StyleGenerator<T> = (params: T) => string
export type StyleTemplate<T> = (clsName: string, params: T) => string

let uniqueIDGenerator = 0

export const style = <T extends object = EmptyObject>(styleFn : StyleTemplate<T>) : StyleGenerator<T> => {
    // A memory cache for each generated CSS fragment.
    const nodeCache = {}

    return ((params : T) : string => {
        // We determine the cache key by generating the CSS fragment with a special clsName ("").
        // If the params are empty, just use an empty string as the key to avoid unnecessary
        // computation of the CSS fragment.
        const key = Object.keys(params).length === 0 ? "" : styleFn("", params)
        const [clsName, setClsName] = useState<string>("")

        // We use "useLayoutEffect" to ensure that the CSS fragment is added to the DOM before
        // the component is rendered. If we used "useEffect", the CSS fragment would be added
        // after the component is rendered, which would cause a flash of unstyled content.
        useLayoutEffect(() => {

            if(!nodeCache[key]) {
                // Generate a unique clsName for the CSS fragment. Using the clsName, we can
                // then generate the CSS fragment and add it to the DOM.
                const clsName = `_csshook-${uniqueIDGenerator}`
                const styleNode = document.createElement("style")
                document.head.appendChild(styleNode)
                styleNode.innerHTML = styleFn(clsName, params)
                nodeCache[key] = {clsName, htmlElement: styleNode, key, count: 0}

                // Increment the unique ID generator - ensuring that no two CSS fragments have
                // the same clsName. 
                uniqueIDGenerator = (uniqueIDGenerator + 1) % Number.MAX_SAFE_INTEGER
            }

            // Increment the count of usages of this CSS fragment. We track the count so that
            // we can know when the CSS fragment is no longer needed and can be removed from
            // the DOM.
            const styleNode = nodeCache[key]
            styleNode.count += 1
            setClsName(styleNode.clsName)

            return () => {
                // The component has been unmounted, so decrement the count of usages of this
                // CSS fragment.
                styleNode.count -= 1;
                
                // If the count is zero, remove the CSS fragment from the DOM and delete it
                // from the cache.
                if(styleNode.count <= 0) {
                    document.head.removeChild(styleNode.htmlElement)
                    delete nodeCache[key]
                }
            }
        }, [key])

        // Return the clsName of the CSS fragment.
        return clsName
    }) as StyleGenerator<T>
}