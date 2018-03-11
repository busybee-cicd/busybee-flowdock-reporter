# busybee-flowdock-reporter
-------
A Busybee 'REST' TestSuite reporter that reports results to Flowdock.

## Quickstart

**Requires NodeJS 8 or higher**

```
# include the BusybeeHtmlReporter at the top of your busybee conf.js
const BusybeeFlowdockReporter = require('busybee-flowdock-reporter').BusybeeFlowdockReporter;

...

# add the following property at the top-level of your busybee conf.js
reporters: [
    new BusybeeFlowdockReporter({
      token: '<YOUR_TOKEN>',
      author: { // The flowdock user to publish the message as
        name: 'My Service',
        avatar: 'https://github.build.ge.com/avatars/u/<your_service>',
        email: '<my_service>@ge.com'
      },
      threadId: 'api-it-results',
      threadTitle: 'CR API IT Results',
      skipInLocalMode: true // do not run when busybee is in 'localMode'
    })
]


```

**optional config keys not shown in the above example**  
resultsUrl - string: If your results are published to a webserver ([Perhaps after building built with something like busybee-html-reporter](https://github.build.ge.com/Busybee/busybee-html-reporter)) then supplying a resultsUrl will wrap the flowdock message in a link to the supplied resultsUrl  
warningThreshold - number: defaults to 85, represents the minimum % of passed tests before marking the entire run as 'UNSTABLE'  
failureThreshold - number: defaults to 75, represents the minimum % of passed tests before marking the entire run as 'FAILED'
