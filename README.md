# erdblock-itunes

## Description
Show an iTunes with data from the store


## Config
| Name           | Description  | Values |
| -------------- | ------------- | ----- |
| `appID`          | The AppID, can be found in the URL to the iTunes web preview (without id prefix) | `284815942` |
| `descriptionLenght` | The max tokens to show from the App Description | `150` |


## Example
````javascript
var iTunes = require("erdblock-itunes")()
iTunes.locals.config.appID.setValue("490217893")
iTunes.locals.config.descriptionLenght.setValue("30")
erdblock.addPlugin(iTunes)
````
