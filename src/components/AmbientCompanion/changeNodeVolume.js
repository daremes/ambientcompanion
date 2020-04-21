export default function(node, audioContext, value) {
  if (node && audioContext) {
    node.gain.setTargetAtTime(value, audioContext.currentTime, 0.005);
  }
}
