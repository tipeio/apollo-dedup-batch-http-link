# @tipe/apollo-dedup-batch-http-link
apollo-dedup-batch-http-link: batches multiple operations into a single HTTP dedup request. Instead of sending a single operation, it sends an array of operations to the server.

[fixes apollo-link/issues/157](https://github.com/apollographql/apollo-link/issues/157)

```bash
npm install --save apollo-link-dedup@1.0.0 apollo-link-batch-http

npm install --save @tipe/apollo-dedup-batch-http-link
```

```js
import { DedupBatchHttpLink } from '@tipe/apollo-dedup-batch-http-link'
```

combined `apollo-link-batch-http` and `apollo-link-dedup`  
[apollo-link-batch-http README](https://github.com/apollographql/apollo-link/tree/master/packages/apollo-link-batch-http)  
[apollo-link-dedup README](https://github.com/apollographql/apollo-link/tree/master/packages/apollo-link-dedup)

<p align="center">
  <a href="https://tipe.io/?ref=github" target="_blank">
    <img  alt="Tipe" src="https://user-images.githubusercontent.com/1016365/30999155-30430eb8-a488-11e7-850e-a7c38dad77c1.png" class="img-responsive">
  </a>
</p>
