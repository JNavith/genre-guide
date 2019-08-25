<script>
  export let startOpen = false;
  let isOpen = startOpen;

  const toggle = () => (isOpen = !isOpen);
  const open = () => (isOpen = true);
  const close = () => (isOpen = false);
</script>

<slot {isOpen} {toggle} {open} {close} />
