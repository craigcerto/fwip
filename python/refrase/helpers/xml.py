"""XML tag wrapping utility."""


def wrap_xml(tag: str, content: str) -> str:
    """Wrap content in XML tags.

    Args:
        tag: The XML tag name.
        content: The content to wrap.

    Returns:
        Content wrapped in opening and closing XML tags.
    """
    return f"<{tag}>\n{content}\n</{tag}>"
