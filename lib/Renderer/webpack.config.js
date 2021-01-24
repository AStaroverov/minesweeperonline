const path = require('path');

module.exports = [{
  outputPath: 'squares',
  entry: {
    main: path.join(__dirname, './examples/squares/index.ts'),
    worker: path.join(__dirname, './examples/squares/worker.ts')
  }
}, {
  outputPath: 'triangles',
  entry: {
    main: path.join(__dirname, './examples/triangles/index.ts'),
    worker: path.join(__dirname, './examples/triangles/worker.ts')
  }
}, {
  outputPath: 'events',
  entry: {
    main: path.join(__dirname, './examples/events/index.ts'),
    worker: path.join(__dirname, './examples/events/worker.ts')
  }
}, {
  outputPath: 'graph',
  entry: {
    main: path.join(__dirname, './examples/graph/index.ts'),
    worker: path.join(__dirname, './examples/graph/worker.ts')
  }
}, {
  outputPath: 'camera',
  entry: {
    main: path.join(__dirname, './examples/camera/index.ts'),
    worker: path.join(__dirname, './examples/camera/worker.ts')
  }
}, {
  outputPath: 'mobx',
  entry: {
    main: path.join(__dirname, './examples/mobx/index.ts'),
    worker: path.join(__dirname, './examples/mobx/worker.ts')
  }
}].map(data => {
  return {
    mode: 'development',
    entry: data.entry,
    output: {
      path: path.join(__dirname, `/dist/${data.outputPath}/`),
      publicPath: `/dist/${data.outputPath}/`,
      filename: '[name].js'
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    module: {
      rules: [{
        test: /\.ts$/,
        loader: 'ts-loader'
      }]
    },
    plugins: [
      new (require('html-webpack-plugin'))({
        template: './examples/index.html',
        inject: false
      })
    ]
  };
});
