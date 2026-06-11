"use client";

import { AnimatePresence, motion } from "framer-motion";

// Bottom sheet — slides up from the bottom, comfortable to reach on a phone.
export default function Sheet({ open, onClose, children }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md rounded-t-3xl bg-surface p-5 pb-8 ring-1 ring-border safe-b"
          >
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
