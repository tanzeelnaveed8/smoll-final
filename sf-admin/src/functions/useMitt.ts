import mitt from 'mitt'

type Events = {
  'table-view:update': void
}

const emitter = mitt<Events>()

const useMitt = () => {
  return {
    emitter
  }
}

export default useMitt
