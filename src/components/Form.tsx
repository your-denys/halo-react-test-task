import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { fetchCities, fetchSpecialties, fetchDoctors } from '../api';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  RadioGroup,
  Radio,
} from '@mui/material';
import './Form.css';

interface City {
  id: number;
  name: string;
}

interface Specialty {
  id: number;
  name: string;
  params?: {
    gender: string;
  };
}

interface Doctor {
  id: number;
  name: string;
  surname: string;
  cityId: number;
  specialityId: number;
  isPediatrician: boolean;
}

const Form: React.FC = () => {
  const initialValues = {
    name: '',
    birthday: '',
    sex: '',
    city: '',
    specialty: '',
    doctor: '',
    email: '',
    mobile: '',
  };
  const [cities, setCities] = useState<City[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [error, setError] = useState({
    cities: '',
    specialties: '',
    doctor: '',
  });

  useEffect(() => {
    fetchCities()
      .then((response) => {
        setCities(response.data);
      })
      .catch((error) => {
        setError((prevError) => ({
          ...prevError,
          cities: `Cities error: ${error}`,
        }));
      });

    fetchSpecialties()
      .then((response) => {
        setSpecialties(response.data);
      })
      .catch((error) => {
        setError((prevError) => ({
          ...prevError,
          specialties: `Specialties error: ${error}`,
        }));
      });

    fetchDoctors()
      .then((response) => {
        setDoctors(response.data);
      })
      .catch((error) => {
        setError((prevError) => ({
          ...prevError,
          doctor: `Doctors error: ${error}`,
        }));
      });
  }, []);

  const handleFormSubmit = (values: typeof initialValues) => {
    console.log(values);
    formik.resetForm();
  };

  const formik = useFormik({
    initialValues,
    validate: (values) => {
      const errors: Partial<typeof initialValues> = {};
      if (!values.name) {
        errors.name = 'Required';
      } else if (/\d/.test(values.name)) {
        errors.name = 'Name should not contain numbers';
      }

      if (!values.birthday) {
        errors.birthday = 'Required';
      } else if (/[^0-9\\/]/.test(values.birthday)) {
        errors.birthday = 'Birthday should not contain letters';
      }

      if (!values.sex) {
        errors.sex = 'Required';
      }

      if (!values.city) {
        errors.city = 'Required';
      }

      if (!values.email && !values.mobile) {
        errors.email = 'At least one field is required';
        errors.mobile = 'At least one field is required';
      }

      return errors;
    },
    onSubmit: handleFormSubmit,
  });

  const calculateAge = (birthday: string) => {
    const parts = birthday.split('/');
    const birthDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    const now = new Date();
    let age = now.getFullYear() - birthDate.getFullYear();

    if (now.getMonth() < birthDate.getMonth()) {
      age--;
    } else if (
      now.getMonth() === birthDate.getMonth() &&
      now.getDate() < birthDate.getDate()
    ) {
      age--;
    }

    return age;
  };
  const handleBirthdayChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    const formattedValue = value
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d{1,2})/, (match, day, month) => {
      if (parseInt(day, 10) > 31) {
        day = '31';
      }
      if (parseInt(month, 10) > 12) {
        month = '12';
      }
      return `${day}/${month}`;
    })
    .replace(/^(.{5})(\d+)/, (match, prefix, year) => {
      const currentYear = new Date().getFullYear();
      if (parseInt(year, 10) > currentYear) {
        year = currentYear.toString();
      }
      return `${prefix}/${year}`;
    });
    formik.setFieldValue(name, formattedValue);
  };
  const filterHandleBirthday = (doctor: Doctor) => {
    const isAdult =
      calculateAge(formik.values.birthday) >= 18 ? false : true;
    if (formik.values.birthday) {
      return (
        formik.values.birthday !== '' &&
        doctor.isPediatrician === isAdult
      );
    }
    if (formik.values.birthday === '') {
      return true;
    }
  };

  const filterDoctorsByCity = (doctor: Doctor) => {
    const selectedCity = cities.find(
      ({ name }) => name === formik.values.city
    );
    return !formik.values.city || doctor.cityId === selectedCity?.id;
  };

  const filterSpecialtiesBySex = (specialty: Specialty) => {
    if (formik.values.sex) {
      return (
        specialty.params?.gender === formik.values.sex ||
        !specialty.params?.gender
      );
    }
    return true;
  };

  const filterDoctorsBySpecialty = (doctor: Doctor) => {
    const selectedSpecialty = specialties.find(
      ({ name }) => name === formik.values.specialty
    );
    return (
      !formik.values.specialty ||
      doctor.specialityId === selectedSpecialty?.id
    );
  };

  useEffect(() => {
    const selectedDoctor = doctors.find(
      ({ name }) => name === formik.values.doctor
    );
    if (selectedDoctor) {
      const selectedCitybyDoctor = cities.find(
        ({ id }) => id === selectedDoctor.cityId
      );
      const selectedSpecialtybyDoctor = specialties.find(
        ({ id }) => id === selectedDoctor.specialityId
      );
      console.log(selectedCitybyDoctor);
      formik.setFieldValue('city', selectedCitybyDoctor?.name || '');
      formik.setFieldValue(
        'specialty',
        selectedSpecialtybyDoctor?.name || ''
      );
      console.log(selectedDoctor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctors, formik.values.doctor]);

  return (
    <form className="form-container" onSubmit={formik.handleSubmit}>
      <TextField
        id="name"
        name="name"
        label="Name*"
        variant="outlined"
        fullWidth
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.name}
        error={formik.touched.name && !!formik.errors.name}
        helperText={formik.touched.name && formik.errors.name}
      />
      <TextField
        id="birthday"
        name="birthday"
        label="Birthday Date*"
        variant="outlined"
        fullWidth
        onChange={handleBirthdayChange}
        onBlur={formik.handleBlur}
        value={formik.values.birthday}
        error={formik.touched.birthday && !!formik.errors.birthday}
        helperText={formik.touched.birthday && formik.errors.birthday}
      />
      <FormControl component="fieldset">
        <RadioGroup
          id="sex"
          name="sex"
          value={formik.values.sex}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        >
          <FormControlLabel
            value="Male"
            control={<Radio />}
            label="Male"
          />
          <FormControlLabel
            value="Female"
            control={<Radio />}
            label="Female"
          />
        </RadioGroup>
      </FormControl>
      <FormControl variant="outlined" fullWidth>
        <InputLabel id="city-label">City*</InputLabel>
        <Select
          id="city"
          name="city"
          label="City*"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.city}
          error={formik.touched.city && !!formik.errors.city}
        >
          {!error.cities ? (
            cities.map((city) => (
              <MenuItem key={city.id} value={city.name}>
                {city.name}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>{error.cities}</MenuItem>
          )}
        </Select>
      </FormControl>
      <FormControl variant="outlined" fullWidth>
        <InputLabel id="specialty-label">Doctor Specialty</InputLabel>
        <Select
          id="specialty"
          name="specialty"
          label="Doctor Specialty*"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.specialty}
          error={
            formik.touched.specialty && !!formik.errors.specialty
          }
        >
          {!error.specialties ? specialties.map(
            (specialty) =>
              filterSpecialtiesBySex(specialty) && (
                <MenuItem key={specialty.id} value={specialty.name}>
                  {specialty.name}
                </MenuItem>
              )
          ) : <MenuItem disabled>{error.specialties}</MenuItem>
          }
        </Select>
      </FormControl>
      <FormControl variant="outlined" fullWidth>
        <InputLabel id="doctor-label">Doctor*</InputLabel>
        <Select
          id="doctor"
          name="doctor"
          label="Doctor*"
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          value={formik.values.doctor}
          error={formik.touched.doctor && !!formik.errors.doctor}
        >
          {doctors
            .filter(filterHandleBirthday)
            .filter(filterDoctorsByCity)
            .filter(filterDoctorsBySpecialty).length ? (
            doctors
              .filter(filterHandleBirthday)
              .filter(filterDoctorsByCity)
              .filter(filterDoctorsBySpecialty)
              .map((doctor) => (
                <MenuItem key={doctor.id} value={doctor.name}>
                  {doctor.name} {doctor.surname}
                </MenuItem>
              ))
          ) : error.doctor ? (
            <MenuItem disabled >{error.doctor}</MenuItem>
          ) : <MenuItem disabled >Doctors not found</MenuItem>}
        </Select>
      </FormControl>
      <TextField
        id="email"
        name="email"
        type="mail"
        label="Email"
        variant="outlined"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.email}
        fullWidth
        error={formik.touched.email && !!formik.errors.email}
        helperText={formik.touched.email && formik.errors.email}
      />

      <TextField
        id="mobile"
        name="mobile"
        label="Mobile number"
        variant="outlined"
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        value={formik.values.mobile}
        fullWidth
        error={formik.touched.mobile && !!formik.errors.mobile}
        helperText={formik.touched.mobile && formik.errors.mobile}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        disabled={!formik.isValid || formik.isSubmitting}
      >
        Submit
      </Button>
    </form>
  );
};

export default Form;
