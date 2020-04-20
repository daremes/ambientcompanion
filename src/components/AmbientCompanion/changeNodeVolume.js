export default function(node, audioContext, value) {
  if (node && audioContext) {
    node.gain.setValueAtTime(value, audioContext.currentTime);
  }
}
