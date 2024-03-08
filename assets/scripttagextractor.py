#!/usr/bin/env python3

# load pickle file from first argument, then exit
import pickle
import os

# get the directory of your script
localdir = os.path.dirname(os.path.realpath(__file__))

with open(localdir + "/scripttagextractor.pkl", 'rb') as f:
    data = pickle.load(f)