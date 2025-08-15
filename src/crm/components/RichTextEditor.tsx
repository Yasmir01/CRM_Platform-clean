import * as React from "react";
import {
  Box,
  Stack,
  IconButton,
  Divider,
  Typography,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  ButtonGroup,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import FormatBoldRoundedIcon from "@mui/icons-material/FormatBoldRounded";
import FormatItalicRoundedIcon from "@mui/icons-material/FormatItalicRounded";
import FormatUnderlinedRoundedIcon from "@mui/icons-material/FormatUnderlinedRounded";
import FormatStrikethroughRoundedIcon from "@mui/icons-material/FormatStrikethroughRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import FormatListNumberedRoundedIcon from "@mui/icons-material/FormatListNumberedRounded";
import FormatAlignLeftRoundedIcon from "@mui/icons-material/FormatAlignLeftRounded";
import FormatAlignCenterRoundedIcon from "@mui/icons-material/FormatAlignCenterRounded";
import FormatAlignRightRoundedIcon from "@mui/icons-material/FormatAlignRightRounded";
import FormatAlignJustifyRoundedIcon from "@mui/icons-material/FormatAlignJustifyRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import LinkOffRoundedIcon from "@mui/icons-material/LinkOffRounded";
import ImageRoundedIcon from "@mui/icons-material/ImageRounded";
import FormatColorTextRoundedIcon from "@mui/icons-material/FormatColorTextRounded";
import FormatColorFillRoundedIcon from "@mui/icons-material/FormatColorFillRounded";
import FormatIndentIncreaseRoundedIcon from "@mui/icons-material/FormatIndentIncreaseRounded";
import FormatIndentDecreaseRoundedIcon from "@mui/icons-material/FormatIndentDecreaseRounded";
import FormatClearRoundedIcon from "@mui/icons-material/FormatClearRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import RedoRoundedIcon from "@mui/icons-material/RedoRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  disabled?: boolean;
  showHtmlMode?: boolean;
  label?: string;
}

const fontSizes = [
  { value: "1", label: "8pt" },
  { value: "2", label: "10pt" },
  { value: "3", label: "12pt" },
  { value: "4", label: "14pt" },
  { value: "5", label: "18pt" },
  { value: "6", label: "24pt" },
  { value: "7", label: "36pt" },
];

const fontFamilies = [
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Times New Roman, serif", label: "Times New Roman" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
  { value: "Verdana, sans-serif", label: "Verdana" },
  { value: "Courier New, monospace", label: "Courier New" },
  { value: "Impact, sans-serif", label: "Impact" },
];

const textColors = [
  "#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#FFFFFF",
  "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
  "#800000", "#008000", "#000080", "#808000", "#800080", "#008080",
  "#FFA500", "#FFC0CB", "#A52A2A", "#808080", "#000000", "#FF69B4"
];

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter text here...",
  minHeight = 200,
  maxHeight = 600,
  disabled = false,
  showHtmlMode = true,
  label
}: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [isHtmlMode, setIsHtmlMode] = React.useState(false);
  const [htmlContent, setHtmlContent] = React.useState(value);
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false);
  const [imageDialogOpen, setImageDialogOpen] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");
  const [linkText, setLinkText] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [imageAlt, setImageAlt] = React.useState("");
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [uploadMethod, setUploadMethod] = React.useState<'url' | 'file'>('file');

  const execCommand = (command: string, value?: string) => {
    if (disabled) return;
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    return null;
  };

  const restoreSelection = (range: Range | null) => {
    if (range) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  const handleContentChange = () => {
    if (editorRef.current && !disabled) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const handleHtmlModeToggle = () => {
    if (isHtmlMode) {
      // Switching from HTML to visual mode
      setIsHtmlMode(false);
      onChange(htmlContent);
    } else {
      // Switching from visual to HTML mode
      setIsHtmlMode(true);
      setHtmlContent(value);
    }
  };

  const handleHtmlContentChange = (newHtml: string) => {
    setHtmlContent(newHtml);
    onChange(newHtml);
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      execCommand('insertHTML', `<a href="${linkUrl}" target="_blank">${linkText}</a>`);
      setLinkUrl("");
      setLinkText("");
      setLinkDialogOpen(false);
    }
  };

  const insertImage = () => {
    if (uploadMethod === 'url' && imageUrl) {
      execCommand('insertHTML', `<img src="${imageUrl}" alt="${imageAlt}" style="max-width: 100%; height: auto;" />`);
    } else if (uploadMethod === 'file' && imageFile) {
      // Create a local URL for the uploaded file
      const localUrl = URL.createObjectURL(imageFile);
      execCommand('insertHTML', `<img src="${localUrl}" alt="${imageAlt}" style="max-width: 100%; height: auto;" />`);
    }
    setImageUrl("");
    setImageAlt("");
    setImageFile(null);
    setImageDialogOpen(false);
  };

  const handleImageFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
    }
  };

  const insertColor = (color: string, isBackground = false) => {
    const command = isBackground ? 'backColor' : 'foreColor';
    execCommand(command, color);
  };

  React.useEffect(() => {
    if (editorRef.current && !isHtmlMode) {
      const currentContent = editorRef.current.innerHTML;
      const newValue = value || "";

      // Only update if content is different and we're not actively typing
      if (currentContent !== newValue && document.activeElement !== editorRef.current) {
        const savedRange = saveSelection();
        editorRef.current.innerHTML = newValue;
        restoreSelection(savedRange);
      }
    }
  }, [value, isHtmlMode]);

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
      {label && (
        <Typography variant="subtitle2" sx={{ p: 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
          {label}
        </Typography>
      )}
      
      {/* Toolbar */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          p: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        {/* Font Family */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value=""
            displayEmpty
            onChange={(e) => execCommand('fontName', e.target.value)}
            disabled={disabled || isHtmlMode}
          >
            <MenuItem value="" disabled>
              <Typography variant="body2">Font</Typography>
            </MenuItem>
            {fontFamilies.map((font) => (
              <MenuItem key={font.value} value={font.value}>
                <Typography variant="body2" sx={{ fontFamily: font.value }}>
                  {font.label}
                </Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Font Size */}
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <Select
            value=""
            displayEmpty
            onChange={(e) => execCommand('fontSize', e.target.value)}
            disabled={disabled || isHtmlMode}
          >
            <MenuItem value="" disabled>
              <Typography variant="body2">Size</Typography>
            </MenuItem>
            {fontSizes.map((size) => (
              <MenuItem key={size.value} value={size.value}>
                <Typography variant="body2">{size.label}</Typography>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider orientation="vertical" flexItem />

        {/* Text Formatting */}
        <ButtonGroup size="small" disabled={disabled || isHtmlMode}>
          <Tooltip title="Bold">
            <IconButton onClick={() => execCommand('bold')}>
              <FormatBoldRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton onClick={() => execCommand('italic')}>
              <FormatItalicRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Underline">
            <IconButton onClick={() => execCommand('underline')}>
              <FormatUnderlinedRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Strikethrough">
            <IconButton onClick={() => execCommand('strikeThrough')}>
              <FormatStrikethroughRoundedIcon />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Text Colors */}
        <Stack direction="row" spacing={0.5}>
          <FormControl size="small" sx={{ minWidth: 60 }}>
            <Select
              value=""
              displayEmpty
              onChange={(e) => insertColor(e.target.value)}
              disabled={disabled || isHtmlMode}
              renderValue={() => (
                <Tooltip title="Text Color">
                  <FormatColorTextRoundedIcon />
                </Tooltip>
              )}
            >
              <MenuItem value="" disabled>Text Color</MenuItem>
              {textColors.map((color) => (
                <MenuItem key={`text-${color}`} value={color}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      backgroundColor: color,
                      border: '1px solid #ccc',
                      mr: 1,
                      display: 'inline-block'
                    }}
                  />
                  {color}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 60 }}>
            <Select
              value=""
              displayEmpty
              onChange={(e) => insertColor(e.target.value, true)}
              disabled={disabled || isHtmlMode}
              renderValue={() => (
                <Tooltip title="Background Color">
                  <FormatColorFillRoundedIcon />
                </Tooltip>
              )}
            >
              <MenuItem value="" disabled>Background</MenuItem>
              {textColors.map((color) => (
                <MenuItem key={`bg-${color}`} value={color}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      backgroundColor: color,
                      border: '1px solid #ccc',
                      mr: 1,
                      display: 'inline-block'
                    }}
                  />
                  {color}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Divider orientation="vertical" flexItem />

        {/* Lists */}
        <ButtonGroup size="small" disabled={disabled || isHtmlMode}>
          <Tooltip title="Bullet List">
            <IconButton onClick={() => execCommand('insertUnorderedList')}>
              <FormatListBulletedRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Numbered List">
            <IconButton onClick={() => execCommand('insertOrderedList')}>
              <FormatListNumberedRoundedIcon />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Alignment */}
        <ButtonGroup size="small" disabled={disabled || isHtmlMode}>
          <Tooltip title="Align Left">
            <IconButton onClick={() => execCommand('justifyLeft')}>
              <FormatAlignLeftRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Center">
            <IconButton onClick={() => execCommand('justifyCenter')}>
              <FormatAlignCenterRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Right">
            <IconButton onClick={() => execCommand('justifyRight')}>
              <FormatAlignRightRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Justify">
            <IconButton onClick={() => execCommand('justifyFull')}>
              <FormatAlignJustifyRoundedIcon />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Indent */}
        <ButtonGroup size="small" disabled={disabled || isHtmlMode}>
          <Tooltip title="Increase Indent">
            <IconButton onClick={() => execCommand('indent')}>
              <FormatIndentIncreaseRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Decrease Indent">
            <IconButton onClick={() => execCommand('outdent')}>
              <FormatIndentDecreaseRoundedIcon />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Insert Elements */}
        <ButtonGroup size="small" disabled={disabled || isHtmlMode}>
          <Tooltip title="Insert Link">
            <IconButton onClick={() => setLinkDialogOpen(true)}>
              <LinkRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove Link">
            <IconButton onClick={() => execCommand('unlink')}>
              <LinkOffRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Insert Image">
            <IconButton onClick={() => setImageDialogOpen(true)}>
              <ImageRoundedIcon />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        <Divider orientation="vertical" flexItem />

        {/* Actions */}
        <ButtonGroup size="small" disabled={disabled || isHtmlMode}>
          <Tooltip title="Undo">
            <IconButton onClick={() => execCommand('undo')}>
              <UndoRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Redo">
            <IconButton onClick={() => execCommand('redo')}>
              <RedoRoundedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear Formatting">
            <IconButton onClick={() => execCommand('removeFormat')}>
              <FormatClearRoundedIcon />
            </IconButton>
          </Tooltip>
        </ButtonGroup>

        {showHtmlMode && (
          <>
            <Divider orientation="vertical" flexItem />
            <Tooltip title={isHtmlMode ? "Visual Mode" : "HTML Mode"}>
              <IconButton
                onClick={handleHtmlModeToggle}
                color={isHtmlMode ? "primary" : "default"}
                disabled={disabled}
              >
                <CodeRoundedIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Stack>

      {/* Editor Content */}
      {isHtmlMode ? (
        <TextField
          multiline
          fullWidth
          value={htmlContent}
          onChange={(e) => handleHtmlContentChange(e.target.value)}
          placeholder="Enter HTML content..."
          disabled={disabled}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': { border: 'none' },
            },
            '& .MuiInputBase-input': {
              minHeight: minHeight - 20,
              maxHeight: maxHeight - 20,
              fontFamily: 'monospace',
              fontSize: '14px',
              lineHeight: 1.4,
            }
          }}
        />
      ) : (
        <Box
          ref={editorRef}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onInput={handleContentChange}
          sx={{
            minHeight,
            maxHeight,
            p: 2,
            backgroundColor: disabled ? 'action.disabledBackground' : 'background.paper',
            color: disabled ? 'text.disabled' : 'text.primary',
            fontSize: '14px',
            fontFamily: 'inherit',
            lineHeight: 1.6,
            overflow: 'auto',
            '&:focus': {
              outline: 'none',
            },
            '&:empty:before': {
              content: `"${placeholder}"`,
              color: 'text.secondary',
              fontStyle: 'italic',
            },
            '& p': { margin: '0 0 1em 0' },
            '& ul': {
              paddingLeft: '30px',
              margin: '0 0 1em 0',
              listStyleType: 'disc'
            },
            '& ol': {
              paddingLeft: '30px',
              margin: '0 0 1em 0',
              listStyleType: 'decimal'
            },
            '& li': {
              marginBottom: '0.25em',
              display: 'list-item'
            },
            '& a': { color: 'primary.main', textDecoration: 'underline' },
            '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 },
            '& blockquote': {
              borderLeft: '4px solid',
              borderColor: 'divider',
              paddingLeft: 2,
              margin: '0 0 1em 0',
              fontStyle: 'italic',
              backgroundColor: 'action.hover',
              padding: 2,
              borderRadius: 1,
            },
            '& pre': {
              backgroundColor: 'action.hover',
              padding: 1,
              borderRadius: 1,
              fontSize: '13px',
              fontFamily: 'monospace',
              overflow: 'auto',
            },
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              margin: '0 0 0.5em 0',
              fontWeight: 'bold',
            },
            '& h1': { fontSize: '2em' },
            '& h2': { fontSize: '1.5em' },
            '& h3': { fontSize: '1.17em' },
            '& h4': { fontSize: '1em' },
            '& h5': { fontSize: '0.83em' },
            '& h6': { fontSize: '0.67em' },
          }}
        />
      )}

      {/* Insert Link Dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Insert Link</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Link Text"
              fullWidth
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Enter the text to display"
            />
            <TextField
              label="URL"
              fullWidth
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={insertLink} disabled={!linkUrl || !linkText}>
            Insert Link
          </Button>
        </DialogActions>
      </Dialog>

      {/* Insert Image Dialog */}
      <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Insert Image</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <ButtonGroup fullWidth>
              <Button
                variant={uploadMethod === 'file' ? 'contained' : 'outlined'}
                onClick={() => setUploadMethod('file')}
              >
                Upload File
              </Button>
              <Button
                variant={uploadMethod === 'url' ? 'contained' : 'outlined'}
                onClick={() => setUploadMethod('url')}
              >
                Use URL
              </Button>
            </ButtonGroup>

            {uploadMethod === 'file' ? (
              <>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="image-upload"
                  type="file"
                  onChange={handleImageFileUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    startIcon={<ImageRoundedIcon />}
                    sx={{ py: 2 }}
                  >
                    {imageFile ? imageFile.name : "Choose Image File"}
                  </Button>
                </label>
              </>
            ) : (
              <TextField
                label="Image URL"
                fullWidth
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            )}

            <TextField
              label="Alt Text (Optional)"
              fullWidth
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Description of the image"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImageDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={insertImage}
            disabled={uploadMethod === 'url' ? !imageUrl : !imageFile}
          >
            Insert Image
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
