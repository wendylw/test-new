/* eslint-disable jsx-a11y/no-autofocus */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { X, PencilSimple } from 'phosphor-react';
import styles from './AddSpecialNotes.module.scss';
import Drawer from '../../../../../common/components/Drawer';
import DrawerHeader from '../../../../../common/components/Drawer/DrawerHeader';
import Button from '../../../../../common/components/Button';
import { actions } from '../../redux/productDetail';
import { hideNotesDrawer, showNotesDrawer } from '../../redux/productDetail/thunks';
import { getIfCommentsShowStatus, getIfHasNotesContents, getNotesContents } from '../../redux/productDetail/selectors';

const NOTES_MAX_LENGTH = 140;
const AddSpecialNotes = () => {
  const { t } = useTranslation();
  const commentsTextareaRef = useRef(null);
  const notesContents = useSelector(getNotesContents);
  const showComments = useSelector(getIfCommentsShowStatus);
  const [notes, setNotes] = useState('');
  const dispatch = useDispatch();
  const ifHasNotesContents = useSelector(getIfHasNotesContents);
  const onClose = () => {
    dispatch(hideNotesDrawer());
  };
  const saveSpecialNotes = () => {
    dispatch(actions.updateAndSaveComments(notes));
    onClose();
  };
  const handleNotesChange = useCallback(
    event => {
      setNotes(event.target.value);
    },

    [setNotes]
  );
  const writeNotesContent = () => {
    dispatch(showNotesDrawer());
  };

  useEffect(() => {
    setNotes(notesContents);
  }, [notesContents]);

  useEffect(() => {
    if (showComments) {
      commentsTextareaRef.current.selectionEnd = notesContents.length;
    }
  }, [showComments]);

  return (
    <>
      {ifHasNotesContents ? (
        <div className="tw-p-16 sm:tw-p-16px">
          <div className="tw-flex tw-justify-between tw-items-center">
            <span className="tw-font-bold">{t('SpecialInstructions')}</span>
            <Button type="text" className={styles.AddSpecialNotesEditButton} onClick={writeNotesContent}>
              <PencilSimple size={18} className="tw-text-blue" />
              <span className="tw-font-bold tw-text-blue tw-text-base tw-not-italic tw-p-4 sm:tw-p-4px">
                {t('Edit')}
              </span>
            </Button>
          </div>
          <p className="tw-py-8 sm:tw-py-8px tw-text-gray-600 tw-break-words">{notesContents}</p>
        </div>
      ) : (
        <div className="tw-mx-4 sm:tw-mx-4px tw-my-6 sm:tw-my-6px">
          <Button type="text" onClick={writeNotesContent}>
            <PencilSimple size={18} className="tw-text-blue" />
            <span className="tw-font-bold tw-text-blue tw-text-base tw-not-italic tw-p-4 sm:tw-p-4px">
              {t('AddSpecialInstructions')}
            </span>
          </Button>
        </div>
      )}
      <Drawer
        className={styles.AddSpecialNotes}
        style={{
          height: '80%',
        }}
        show={showComments}
        onClose={onClose}
        header={
          <DrawerHeader
            left={<X weight="light" className="tw-flex-shrink-0 tw-text-2xl tw-text-gray" onClick={onClose} />}
          >
            <div className="tw-flex tw-flex-col tw-items-center">
              <span className="tw-font-bold tw-text-lg tw-leading-relaxed">{t('SpecialInstructions')}</span>
            </div>
          </DrawerHeader>
        }
      >
        <div className={styles.AddSpecialNotesInputContainer}>
          <textarea
            ref={ref => {
              commentsTextareaRef.current = ref;
            }}
            value={notes}
            onChange={handleNotesChange}
            className={styles.AddSpecialNotesInputContent}
            placeholder={t('EgLessSugar')}
            row={5}
            maxLength={NOTES_MAX_LENGTH}
            autoFocus
          />
          <p className={styles.AddSpecialNotesLimitLength}>
            {t('LengthLimitOfNotes', { inputLength: notes.length, maxLength: NOTES_MAX_LENGTH })}
          </p>
        </div>
        <div className={styles.AddSpecialNotesSaveContainer}>
          <Button type="primary" className={styles.AddSpecialNotesSaveButton} onClick={saveSpecialNotes}>
            {t('Save')}
          </Button>
        </div>
      </Drawer>
    </>
  );
};

AddSpecialNotes.displayName = 'AddSpecialNotes';

export default AddSpecialNotes;
