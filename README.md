# 🚀 Welcome to IAQJS

## Installation

### NPM

```sh
    npm install iaqjs
```

```js
    import IAQ from 'iaqjs'
```

Javascript

```html
    <script src="/path/to/js">
    <script>
        let iaq = new window.IAQ();
    </script> 
```

## Usage

* Initialize
```typescript
    var AQ = new IAQ("clientKey")
    
```
* Add widget or measurements to DOM:  Call the method generate by passing a DOM and options Object

```typescript

    AQ.generate(domElement, options) // Check Options interface
    interface Options {
        measurementIds?: Array<string>,
        widgetId?: string,
        autoUpdate?: Boolean, // Updates the widget every 5 minutes, Default True
        theme?: Theme // Provide a theme object, Default theme provided
        size?: Size
    }
    interface Theme {
        scoreColor: string,
        backgroundColor: string,
        iconColor: string,
        unitColor: string,
    }
```
* Data: You can also retrieve data by calling the method data, it takes options (See interface options) as an argument

```typescript
    // Promises and async/await supported
    AQ.data(options).then(function(result) {
        // result is a data Object. Check Reference below
        console.log(result)
    })

    interface Measurement {
        type: string,
        curVal?: string,
        curScore: string,
        icon: string,
        unit?: string,
        name?: string,
        toUse?: string // some measurement only have curScore, toUse denotes what to display
    }
    interface Data {
        name: String,
        measurements: Array<Measurement>
    }
```

