export const parseJson = (jsonString: string) => JSON.parse(jsonString)
export const stringJson = (jsonObject: object | string) => JSON.stringify(jsonObject)
export const toJson = (jsObject: Response) => jsObject.json()
