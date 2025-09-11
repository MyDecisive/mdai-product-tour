When adding actions/reducers, start with the `ACTION_TYPES`
Add an entry to `PayloadMap`
Then write a reducer function in the `reducerFunctions` map

To use actions elsewhere you need to dispatch them:

```
dispatch(actions.BEGIN_ANIMATION())
dispatch(actions.SET_ANIMATION_INDEX(42))
```
