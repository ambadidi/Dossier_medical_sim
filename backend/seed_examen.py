# seed_examen.py
import os
import django

# set up Django’s settings so we can use ORM
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from base.models import Section, Category, SubCategory, Field, Option

# ← delete any old copy first
Section.objects.filter(name="examen clinique").delete()
# avoid double‑runs
if Section.objects.filter(name="examen clinique").exists():
    print("examen clinique already seeded.")
    exit()

sec = Section.objects.create(name="examen clinique")

# examen général
cat = Category.objects.create(section=sec, name="examen général")
for idx, fname in enumerate(["GCS","TA","FR","pouls","température"]):
    Field.objects.create(category=cat, name=fname, field_type="number", order=idx)
Field.objects.create(category=cat, name="coloration des conjonctives", field_type="text", order=5)
Field.objects.create(category=cat, name="autre", field_type="text", order=6)

# examen abdominal
cat2 = Category.objects.create(section=sec, name="examen abdominal")
for sub_name, opts in [
    ("inspection", ["cicatrice","voussure","dépression","circulation veineuse collatérale","autre"]),
    ("palpation",  ["splénomégalie","masse","HPM","autre"]),
    ("percussion", ["tympanisme","matité","autre"]),
]:
    sub = SubCategory.objects.create(category=cat2, name=sub_name)
    fld = Field.objects.create(subcategory=sub, name=sub_name, field_type="multi")
    for label in opts:
        Option.objects.create(field=fld, label=label, is_other=(label=="autre"))

# examen pleuro-pulmonaire
cat3 = Category.objects.create(section=sec, name="examen pleuro-pulmonaire")
for sub_name, opts in [
    ("inspection", ["morphologie du thorax","voussure","dépression","circulation veineuse collatérale","autre"]),
    ("percussion",  ["matité","tympanisme","vibration vocale","autre"]),
    ("auscultation", ["râles sibilants","râles crépitants","râles ronflants","autre"]),
]:
    sub = SubCategory.objects.create(category=cat3, name=sub_name)
    fld = Field.objects.create(subcategory=sub, name=sub_name, field_type="multi")
    for label in opts:
        Option.objects.create(field=fld, label=label, is_other=(label=="autre"))

# examen cardiologique
cat4 = Category.objects.create(section=sec, name="examen cardiologique")
for sub_name, opts in [
    ("auscultation", ["souffle cardiaque","autre"]),
]:
    sub = SubCategory.objects.create(category=cat4, name=sub_name)
    fld = Field.objects.create(subcategory=sub, name=sub_name, field_type="multi")
    for label in opts:
        Option.objects.create(field=fld, label=label, is_other=(label=="autre"))

# examen des aires ganglionnaires
cat5 = Category.objects.create(section=sec, name="examen des aires ganglionnaires")
for sub_name, opts in [
    ("palpation", ["cervicales","sus clav (troisier +++)","inguinales","autre"]),
]:
    sub = SubCategory.objects.create(category=cat5, name=sub_name)
    fld = Field.objects.create(subcategory=sub, name=sub_name, field_type="multi")
    for label in opts:
        Option.objects.create(field=fld, label=label, is_other=(label=="autre"))

print("✅ examen clinique seeded successfully.")
